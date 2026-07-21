

const TABLES = {
  FOUNDERS: 'Founders',
  VENTURES: 'Ventures',
  TRIAGE: 'Triage Responses',
  DIAGNOSTIC: 'Diagnostic Results',
  JOURNEY: 'Journey Events'
};

const GALVISHOT_ACTIONS = new Set([
  'generate_galvishot'
]);

const GALVISIGHT_ACTIONS = new Set([
  'evaluate_galvisight_readiness',
  'save_galvisight_followup',
  'record_galvisight_payment_success',
  'get_or_generate_galvisight',
  'hubspot_recovery_tag',
  'journey_event'
]);

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin':
      env.ALLOWED_ORIGIN || '*',

    'Access-Control-Allow-Methods':
      'GET, POST, OPTIONS',

    'Access-Control-Allow-Headers':
      'Content-Type',

    'Content-Type':
      'application/json'
  };
}

function jsonResponse(
  body,
  status = 200,
  env = {}
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders(env)
    }
  );
}

function safe(
  obj,
  path,
  fallback = ''
) {
  return (
    path
      .split('.')
      .reduce(
        (acc, key) => {
          if (
            acc &&
            Object.prototype.hasOwnProperty.call(
              acc,
              key
            )
          ) {
            return acc[key];
          }

          return undefined;
        },
        obj
      ) ?? fallback
  );
}

function required(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ''
  );
}

function normalizeSessionId(value) {
  return String(value || '').trim();
}

async function airtableRequest(
  env,
  tableName,
  method = 'POST',
  body = null,
  query = ''
) {
  if (
    !env.AIRTABLE_BASE_ID ||
    !env.AIRTABLE_TOKEN
  ) {
    throw new Error(
      'AIRTABLE_BASE_ID or AIRTABLE_TOKEN is not configured'
    );
  }

  const url =
    'https://api.airtable.com/v0/' +
    `${env.AIRTABLE_BASE_ID}/` +
    `${encodeURIComponent(tableName)}` +
    query;

  const response = await fetch(
    url,
    {
      method,

      headers: {
        Authorization:
          `Bearer ${env.AIRTABLE_TOKEN}`,

        'Content-Type':
          'application/json'
      },

      body:
        body !== null
          ? JSON.stringify(body)
          : undefined
    }
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    throw new Error(
      `Airtable ${tableName} failed: ` +
      `${response.status} ` +
      `${JSON.stringify(data)}`
    );
  }

  return data;
}

async function createAirtableRecord(
  env,
  tableName,
  fields
) {
  return airtableRequest(
    env,
    tableName,
    'POST',
    {
      fields
    }
  );
}

async function findExistingBySession(
  env,
  tableName,
  sessionId
) {
  const escapedSessionId =
    String(sessionId)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

  const formula =
    encodeURIComponent(
      `{session_id} = "${escapedSessionId}"`
    );

  const query =
    `?filterByFormula=${formula}` +
    '&maxRecords=1';

  const data =
    await airtableRequest(
      env,
      tableName,
      'GET',
      null,
      query
    );

  if (
    data.records &&
    data.records.length > 0
  ) {
    return data.records[0];
  }

  return null;
}

/*
 * Returns the correct Make webhook.
 *
 * Recommended Worker variables:
 *
 * MAKE_GALVISHOT_WEBHOOK_URL
 * MAKE_GALVISIGHT_WEBHOOK_URL
 *
 * Optional shared fallback:
 *
 * MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL
 */
function resolveMakeWebhook(
  env,
  productName
) {
  if (productName === 'GalviSight') {
    return (
      env.MAKE_GALVISIGHT_WEBHOOK_URL ||
      env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
      ''
    );
  }

  if (productName === 'GalviShot') {
    return (
      env.MAKE_GALVISHOT_WEBHOOK_URL ||
      env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
      ''
    );
  }

  return (
    env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
    ''
  );
}

async function forwardToMake(
  env,
  payload,
  productName
) {
  const webhookUrl =
    resolveMakeWebhook(
      env,
      productName
    );

  if (!webhookUrl) {
    const variableName =
      productName === 'GalviSight'
        ? 'MAKE_GALVISIGHT_WEBHOOK_URL'
        : 'MAKE_GALVISHOT_WEBHOOK_URL';

    return {
      ok: false,
      status: 500,
      data: {
        success: false,
        product: productName,
        message:
          `${variableName} is not configured`
      }
    };
  }

  const response =
    await fetch(
      webhookUrl,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(payload)
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      success: response.ok,
      raw: text
    };
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

function buildFounderFields(payload) {
  return {
    founder_id: safe(
      payload,
      'session.session_id'
    ),

    first_name: safe(
      payload,
      'founder.first_name'
    ),

    last_name: safe(
      payload,
      'founder.last_name'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    phone: safe(
      payload,
      'founder.phone'
    ),

    linkedin_url: safe(
      payload,
      'founder.linkedin_url'
    ),

    consent: Boolean(
      safe(
        payload,
        'founder.consent',
        false
      )
    ),

    source: safe(
      payload,
      'session.source'
    ),

    created_at: safe(
      payload,
      'session.timestamp'
    ),

    last_session_id: safe(
      payload,
      'session.session_id'
    )
  };
}

function buildVentureFields(payload) {
  return {
    venture_id: safe(
      payload,
      'session.session_id'
    ),

    founder_email: safe(
      payload,
      'founder.email'
    ),

    venture_name: safe(
      payload,
      'venture.venture_name'
    ),

    website: safe(
      payload,
      'venture.website'
    ),

    organization_stage: safe(
      payload,
      'venture.organization_stage'
    ),

    organization_type: safe(
      payload,
      'venture.organization_type'
    ),

    industry: safe(
      payload,
      'venture.industry'
    ),

    revenue_range: safe(
      payload,
      'venture.revenue_range'
    ),

    team_size: safe(
      payload,
      'venture.team_size'
    ),

    created_at: safe(
      payload,
      'session.timestamp'
    ),

    session_id: safe(
      payload,
      'session.session_id'
    )
  };
}

function buildTriageFields(payload) {
  const scored =
    payload.scored_answers || {};

  const derived =
    payload.derived_scores || {};

  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    venture_name: safe(
      payload,
      'venture.venture_name'
    ),

    timestamp: safe(
      payload,
      'session.timestamp'
    ),

    source: safe(
      payload,
      'session.source'
    ),

    device_type: safe(
      payload,
      'session.device_type'
    ),

    utm_source: safe(
      payload,
      'session.utm_source'
    ),

    utm_campaign: safe(
      payload,
      'session.utm_campaign'
    ),

    organization_stage: safe(
      payload,
      'venture.organization_stage'
    ),

    organization_type: safe(
      payload,
      'venture.organization_type'
    ),

    industry: safe(
      payload,
      'venture.industry'
    ),

    revenue_range: safe(
      payload,
      'venture.revenue_range'
    ),

    team_size: safe(
      payload,
      'venture.team_size'
    ),

    highest_impact_area: safe(
      payload,
      'priority.highest_impact_area'
    ),

    biggest_challenge: safe(
      payload,
      'open_text.biggest_challenge'
    ),

    one_30_day_problem: safe(
      payload,
      'open_text.one_30_day_problem'
    ),

    growth_blocker: safe(
      payload,
      'open_text.growth_blocker'
    ),

    feels_broken: safe(
      payload,
      'open_text.feels_broken'
    ),

    keeps_up_at_night: safe(
      payload,
      'open_text.keeps_up_at_night'
    ),

    total_score: Number(
      derived.total_score || 0
    ),

    health_band:
      derived.health_band || '',

    lowest_domain:
      derived.lowest_domain || '',

    confidence_percent: Number(
      derived.confidence_percent || 0
    ),

    scoring_version:
      derived.scoring_version ||
      payload.scoring_version ||
      'galvitriage_0_5_worker',

    q01_business_clarity: Number(
      scored.q01_business_clarity || 0
    ),

    q02_stage_signal: Number(
      scored.q02_stage_signal || 0
    ),

    q03_real_problem: Number(
      scored.q03_real_problem || 0
    ),

    q04_ideal_customer: Number(
      scored.q04_ideal_customer || 0
    ),

    q05_attract_customers: Number(
      scored.q05_attract_customers || 0
    ),

    q06_customer_conversations: Number(
      scored.q06_customer_conversations || 0
    ),

    q07_predictable_revenue: Number(
      scored.q07_predictable_revenue || 0
    ),

    q08_revenue_growth_confidence:
      Number(
        scored.q08_revenue_growth_confidence ||
        0
      ),

    q09_revenue_driver_clarity:
      Number(
        scored.q09_revenue_driver_clarity ||
        0
      ),

    q10_customer_satisfaction:
      Number(
        scored.q10_customer_satisfaction ||
        0
      ),

    q11_feedback_improvement:
      Number(
        scored.q11_feedback_improvement ||
        0
      ),

    q12_organized_operations:
      Number(
        scored.q12_organized_operations ||
        0
      ),

    q13_founder_dependency:
      Number(
        scored.q13_founder_dependency ||
        0
      ),

    q14_systems_support_growth:
      Number(
        scored.q14_systems_support_growth ||
        0
      ),

    q15_technology_effectiveness:
      Number(
        scored.q15_technology_effectiveness ||
        0
      ),

    q16_ai_readiness:
      Number(
        scored.q16_ai_readiness ||
        0
      ),

    q17_leadership_confidence:
      Number(
        scored.q17_leadership_confidence ||
        0
      ),

    q18_vision_clarity:
      Number(
        scored.q18_vision_clarity ||
        0
      ),

    q19_decision_information:
      Number(
        scored.q19_decision_information ||
        0
      ),

    q20_execution_action:
      Number(
        scored.q20_execution_action ||
        0
      )
  };
}

function buildDiagnosticFields(payload) {
  const derived =
    payload.derived_scores || {};

  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    product:
      'GalviVitals',

    score: Number(
      derived.total_score || 0
    ),

    classification:
      derived.health_band || '',

    bottleneck:
      derived.lowest_domain || '',

    narrative:
      'Initial GalviVitals generated ' +
      'from GalviTriage 0.5 ' +
      'rules-first scoring.',

    confidence: Number(
      derived.confidence_percent || 0
    ),

    prompt_version:
      derived.scoring_version ||
      'rules_first_v0_5_worker',

    created_at: safe(
      payload,
      'session.timestamp'
    )
  };
}

function buildJourneyFields(payload) {
  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    screen: safe(
      payload,
      'journey_event.screen',
      'GalviTriage'
    ),

    event_name: safe(
      payload,
      'journey_event.event_name',
      'galvitriage_submitted'
    ),

    timestamp: safe(
      payload,
      'session.timestamp'
    ),

    device_type: safe(
      payload,
      'session.device_type'
    ),

    source: safe(
      payload,
      'session.source'
    ),

    utm_source: safe(
      payload,
      'session.utm_source'
    ),

    utm_campaign: safe(
      payload,
      'session.utm_campaign'
    )
  };
}

function buildHubSpotContactProperties(
  payload
) {
  return {
    email: safe(
      payload,
      'founder.email'
    ),

    firstname: safe(
      payload,
      'founder.first_name'
    ),

    lastname: safe(
      payload,
      'founder.last_name'
    ),

    phone: safe(
      payload,
      'founder.phone'
    ),

    company: safe(
      payload,
      'venture.venture_name'
    ),

    website: safe(
      payload,
      'venture.website'
    )
  };
}

async function hubspotRequest(
  env,
  path,
  method = 'POST',
  body = null
) {
  if (
    env.HUBSPOT_ENABLED !== 'true' ||
    !env.HUBSPOT_PRIVATE_APP_TOKEN
  ) {
    return {
      skipped: true,

      reason:
        'HubSpot disabled or ' +
        'HUBSPOT_PRIVATE_APP_TOKEN missing'
    };
  }

  const response =
    await fetch(
      `https://api.hubapi.com${path}`,
      {
        method,

        headers: {
          Authorization:
            `Bearer ` +
            `${env.HUBSPOT_PRIVATE_APP_TOKEN}`,

          'Content-Type':
            'application/json'
        },

        body:
          body !== null
            ? JSON.stringify(body)
            : undefined
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    throw new Error(
      `HubSpot ${path} failed: ` +
      `${response.status} ` +
      `${JSON.stringify(data)}`
    );
  }

  return data;
}

async function upsertHubSpotContact(
  env,
  payload
) {
  const properties =
    buildHubSpotContactProperties(
      payload
    );

  return hubspotRequest(
    env,
    '/crm/v3/objects/contacts',
    'POST',
    {
      properties
    }
  );
}

/*
 * Shared diagnostic action handler.
 *
 * This sends GalviShot or GalviSight
 * actions to Make before the request
 * reaches GalviTriage validation.
 */
async function handleDiagnosticAction(
  env,
  payload,
  action,
  productName
) {
  const sessionId =
    normalizeSessionId(
      safe(
        payload,
        'session.session_id'
      ) ||
      safe(
        payload,
        'session_id'
      )
    );

  if (!required(sessionId)) {
    return jsonResponse(
      {
        success: false,
        product: productName,
        action,

        message:
          `Missing required ${productName} field`,

        required: [
          'session.session_id'
        ]
      },
      400,
      env
    );
  }

  const normalizedPayload = {
    ...payload,

    action,

    product_name:
      payload.product_name ||
      productName,

    current_stage:
      payload.current_stage ||
      `${productName} Processing`,

    session: {
      ...(payload.session || {}),

      session_id:
        sessionId
    }
  };

  const makeResult =
    await forwardToMake(
      env,
      normalizedPayload,
      productName
    );

  const makeData =
    makeResult.data || {};

  /*
   * Return Make's status code.
   *
   * This allows a Make response such as
   * HTTP 402 payment_required to remain
   * HTTP 402 instead of becoming a 500.
   */
  return jsonResponse(
    {
      ...makeData,

      success:
        makeData.success !== undefined
          ? makeData.success
          : makeResult.ok,

      product:
        makeData.product ||
        productName,

      action:
        makeData.action ||
        action,

      session_id:
        makeData.session_id ||
        sessionId
    },
    makeResult.status,
    env
  );
}

export default {
  async fetch(request, env) {
    /*
     * CORS preflight
     */
    if (request.method === 'OPTIONS') {
      return new Response(
        null,
        {
          status: 204,
          headers:
            corsHeaders(env)
        }
      );
    }

    /*
     * Browser health check
     */
    if (request.method === 'GET') {
      return jsonResponse(
        {
          success: true,

          service:
            'GalviCare 0.5 Worker',

          status:
            'available',

          supported_actions: [
            ...GALVISHOT_ACTIONS,
            ...GALVISIGHT_ACTIONS
          ]
        },
        200,
        env
      );
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        {
          success: false,

          message:
            'Method not allowed'
        },
        405,
        env
      );
    }

    try {
      let payload;

      try {
        payload =
          await request.json();
      } catch {
        return jsonResponse(
          {
            success: false,

            message:
              'Invalid or empty JSON body'
          },
          400,
          env
        );
      }

      const action =
        String(
          safe(
            payload,
            'action'
          )
        ).trim();

      /*
       * GALVISHOT ACTION ROUTE
       *
       * Runs before GalviTriage
       * required-field validation.
       */
      if (
        GALVISHOT_ACTIONS.has(action)
      ) {
        return await handleDiagnosticAction(
          env,
          payload,
          action,
          'GalviShot'
        );
      }

      /*
       * GALVISIGHT ACTION ROUTES
       *
       * Runs before GalviTriage
       * required-field validation.
       *
       * Make remains responsible for:
       *
       * - retrieving GalviVault data
       * - calculating confidence
       * - returning follow-up questions
       * - saving follow-up answers
       * - verifying payment/test override
       * - retrieving an existing result first
       * - calling OpenAI only if needed
       * - saving one GalviSight result
       * - updating HubSpot non-blockingly
       */
      if (
        GALVISIGHT_ACTIONS.has(action)
      ) {
        return await handleDiagnosticAction(
          env,
          payload,
          action,
          'GalviSight'
        );
      }

      /*
       * EXISTING GALVITRIAGE FLOW
       */
      const sessionId =
        normalizeSessionId(
          safe(
            payload,
            'session.session_id'
          )
        );

      const email =
        safe(
          payload,
          'founder.email'
        );

      const ventureName =
        safe(
          payload,
          'venture.venture_name'
        );

      if (
        !required(sessionId) ||
        !required(email) ||
        !required(ventureName)
      ) {
        return jsonResponse(
          {
            success: false,

            message:
              'Missing required fields',

            required: [
              'session.session_id',
              'founder.email',
              'venture.venture_name'
            ]
          },
          400,
          env
        );
      }

      /*
       * Prevent duplicate triage records.
       */
      const existingTriage =
        await findExistingBySession(
          env,
          TABLES.TRIAGE,
          sessionId
        );

      if (existingTriage) {
        return jsonResponse(
          {
            success: true,

            duplicate: true,

            message:
              'GalviTriage submission ' +
              'already received',

            next_screen:
              'GalviVitals',

            session_id:
              sessionId,

            existing_record_id:
              existingTriage.id
          },
          200,
          env
        );
      }

      const founder =
        await createAirtableRecord(
          env,
          TABLES.FOUNDERS,
          buildFounderFields(payload)
        );

      const venture =
        await createAirtableRecord(
          env,
          TABLES.VENTURES,
          buildVentureFields(payload)
        );

      const triage =
        await createAirtableRecord(
          env,
          TABLES.TRIAGE,
          buildTriageFields(payload)
        );

      const diagnostic =
        await createAirtableRecord(
          env,
          TABLES.DIAGNOSTIC,
          buildDiagnosticFields(payload)
        );

      const journey =
        await createAirtableRecord(
          env,
          TABLES.JOURNEY,
          buildJourneyFields(payload)
        );

      /*
       * HubSpot is non-blocking.
       *
       * Airtable/GalviCare success should
       * still return even if HubSpot fails.
       */
      const hubspot = {
        attempted: false,
        success: false,
        error: null,
        response: null
      };

      try {
        hubspot.attempted =
          env.HUBSPOT_ENABLED === 'true';

        if (hubspot.attempted) {
          hubspot.response =
            await upsertHubSpotContact(
              env,
              payload
            );

          hubspot.success = true;
        }
      } catch (hubspotError) {
        console.error(
          'HubSpot recovery failed',
          hubspotError
        );

        hubspot.error =
          hubspotError.message;
      }

      return jsonResponse(
        {
          success: true,

          duplicate: false,

          message:
            'GalviTriage submitted successfully',

          next_screen:
            'GalviVitals',

          session_id:
            sessionId,

          records: {
            founder_id:
              founder.id,

            venture_id:
              venture.id,

            triage_id:
              triage.id,

            diagnostic_id:
              diagnostic.id,

            journey_id:
              journey.id
          },

          hubspot
        },
        200,
        env
      );
    } catch (error) {
      console.error(
        'Worker submission failed',
        error
      );

      return jsonResponse(
        {
          success: false,

          message:
            'Worker submission failed',

          error:
            error.message
        },
        500,
        env
      );
    }
  }
};

