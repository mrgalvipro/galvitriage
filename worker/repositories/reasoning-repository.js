export const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();
export const all = async (db, sql, ...params) => {
  const result = await db.prepare(sql).bind(...params).all();
  return Array.isArray(result?.results) ? result.results : [];
};

export async function findBmr(db, bmrId) {
  return first(db, `SELECT * FROM gv1_business_medical_records WHERE bmr_id=?`, bmrId);
}

export async function findEvidence(db, evidenceId) {
  return first(db, `SELECT * FROM gv1_evidence_items WHERE evidence_id=?`, evidenceId);
}

export async function findObservation(db, observationId) {
  return first(db, `SELECT * FROM gv1_observations WHERE observation_id=?`, observationId);
}

export async function findHypothesis(db, hypothesisId) {
  return first(db, `SELECT * FROM gv1_hypotheses WHERE hypothesis_id=?`, hypothesisId);
}

export async function findFinding(db, findingId) {
  return first(db, `SELECT * FROM gv1_findings WHERE finding_id=?`, findingId);
}

export async function loadReceipt(db, scope, key) {
  return first(db, `SELECT * FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=?`, scope, key);
}

export function receiptStmt(db, { id, scope, key, fingerprint, status, entityType, entityId, timestamp }) {
  return db.prepare(`INSERT INTO gv1_idempotency_keys
    (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(id, scope, key, fingerprint, status, entityType, entityId, timestamp);
}

export async function currentObservationForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_observations o
    WHERE o.observation_group_id=?
      AND o.status NOT IN ('rejected','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_observations n WHERE n.supersedes_observation_id=o.observation_id)
    ORDER BY o.version_no DESC LIMIT 1`, groupId);
}

export async function currentHypothesisForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_hypotheses h
    WHERE h.hypothesis_group_id=?
      AND h.status NOT IN ('rejected','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_hypotheses n WHERE n.supersedes_hypothesis_id=h.hypothesis_id)
    ORDER BY h.version_no DESC LIMIT 1`, groupId);
}

export async function currentFindingForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_findings f
    WHERE f.finding_group_id=?
      AND f.status NOT IN ('rejected','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_findings n WHERE n.supersedes_finding_id=f.finding_id)
    ORDER BY f.version_no DESC LIMIT 1`, groupId);
}

export async function observationLinks(db, observationId) {
  return all(db, `SELECT observation_id,evidence_id,support_type,created_at,correlation_id FROM gv1_observation_evidence WHERE observation_id=? ORDER BY evidence_id`, observationId);
}

export async function hypothesisLinks(db, hypothesisId) {
  return all(db, `SELECT hypothesis_id,observation_id,relationship_type,created_at,correlation_id FROM gv1_hypothesis_observations WHERE hypothesis_id=? ORDER BY observation_id`, hypothesisId);
}

export async function findingLinks(db, findingId) {
  const [evidence, observations, hypotheses] = await Promise.all([
    all(db, `SELECT finding_id,evidence_id,support_type,weight,created_at,correlation_id FROM gv1_finding_evidence WHERE finding_id=? ORDER BY evidence_id`, findingId),
    all(db, `SELECT finding_id,observation_id,support_type,created_at,correlation_id FROM gv1_finding_observations WHERE finding_id=? ORDER BY observation_id`, findingId),
    all(db, `SELECT finding_id,hypothesis_id,relationship_type,created_at,correlation_id FROM gv1_finding_hypotheses WHERE finding_id=? ORDER BY hypothesis_id`, findingId)
  ]);
  return { evidence, observations, hypotheses };
}

export async function listCurrentReasoning(db, bmrId) {
  const observations = await all(db, `SELECT * FROM gv1_observations o
    WHERE o.bmr_id=? AND o.status IN ('draft','active')
      AND NOT EXISTS (SELECT 1 FROM gv1_observations n WHERE n.supersedes_observation_id=o.observation_id)
    ORDER BY o.created_at,o.observation_id`, bmrId);
  const hypotheses = await all(db, `SELECT * FROM gv1_hypotheses h
    WHERE h.bmr_id=? AND h.status IN ('draft','active','open')
      AND NOT EXISTS (SELECT 1 FROM gv1_hypotheses n WHERE n.supersedes_hypothesis_id=h.hypothesis_id)
    ORDER BY h.created_at,h.hypothesis_id`, bmrId);
  const findings = await all(db, `SELECT * FROM gv1_findings f
    WHERE f.bmr_id=? AND f.status IN ('draft','active')
      AND NOT EXISTS (SELECT 1 FROM gv1_findings n WHERE n.supersedes_finding_id=f.finding_id)
    ORDER BY f.created_at,f.finding_id`, bmrId);
  return { observations, hypotheses, findings };
}

export async function listReasoningHistory(db, bmrId, limit = 100) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 100));
  const observations = await all(db, `SELECT * FROM gv1_observations WHERE bmr_id=? ORDER BY created_at,observation_id LIMIT ?`, bmrId, safeLimit);
  const hypotheses = await all(db, `SELECT * FROM gv1_hypotheses WHERE bmr_id=? ORDER BY created_at,hypothesis_id LIMIT ?`, bmrId, safeLimit);
  const findings = await all(db, `SELECT * FROM gv1_findings WHERE bmr_id=? ORDER BY created_at,finding_id LIMIT ?`, bmrId, safeLimit);
  return { observations, hypotheses, findings };
}
