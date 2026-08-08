import { first, all, findBmr, findFinding, loadReceipt, receiptStmt } from './reasoning-repository.js';

export { first, all, findBmr, findFinding, loadReceipt, receiptStmt };

export const findRecommendation = (db, id) => first(db, `SELECT * FROM gv1_recommendations WHERE recommendation_id=?`, id);
export const findPlan = (db, id) => first(db, `SELECT * FROM gv1_treatment_plans WHERE treatment_plan_id=?`, id);
export const findPlanItem = (db, id) => first(db, `SELECT * FROM gv1_treatment_plan_items WHERE treatment_plan_item_id=?`, id);
export const findOutcome = (db, id) => first(db, `SELECT * FROM gv1_outcomes WHERE outcome_id=?`, id);
export const findLearningCandidate = (db, id) => first(db, `SELECT * FROM gv1_learning_candidates WHERE learning_candidate_id=?`, id);
export const findAdapterDelivery = (db, id) => first(db, `SELECT * FROM gv1_adapter_deliveries WHERE adapter_delivery_id=?`, id);

export async function recommendationLinks(db, recommendationId) {
  return all(db, `SELECT recommendation_id,finding_id,relationship_type,created_at,correlation_id
    FROM gv1_recommendation_findings WHERE recommendation_id=? ORDER BY finding_id`, recommendationId);
}

export async function planLinks(db, treatmentPlanId) {
  const recommendations = await all(db, `SELECT treatment_plan_id,recommendation_id,created_at,correlation_id
    FROM gv1_treatment_plan_recommendations WHERE treatment_plan_id=? ORDER BY recommendation_id`, treatmentPlanId);
  const findings = await all(db, `SELECT treatment_plan_id,finding_id,created_at,correlation_id
    FROM gv1_treatment_plan_findings WHERE treatment_plan_id=? ORDER BY finding_id`, treatmentPlanId);
  const items = await all(db, `SELECT * FROM gv1_treatment_plan_items WHERE treatment_plan_id=? ORDER BY sequence_number,treatment_plan_item_id`, treatmentPlanId);
  const events = await all(db, `SELECT * FROM gv1_treatment_events WHERE treatment_plan_id=? ORDER BY occurred_at,treatment_event_id`, treatmentPlanId);
  return { recommendations, findings, items, events };
}

export async function outcomeLinks(db, outcomeId) {
  return all(db, `SELECT outcome_id,evidence_id,relationship_type,created_at,correlation_id
    FROM gv1_outcome_evidence WHERE outcome_id=? ORDER BY evidence_id`, outcomeId);
}

export async function currentRecommendationForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_recommendations r
    WHERE r.recommendation_group_id=? AND r.status NOT IN ('declined','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_recommendations n WHERE n.supersedes_recommendation_id=r.recommendation_id)
    ORDER BY r.version_no DESC LIMIT 1`, groupId);
}

export async function currentPlanForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_treatment_plans p
    WHERE p.treatment_plan_group_id=? AND p.status NOT IN ('cancelled','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_treatment_plans n WHERE n.supersedes_treatment_plan_id=p.treatment_plan_id)
    ORDER BY p.version_no DESC LIMIT 1`, groupId);
}

export async function currentOutcomeForGroup(db, groupId) {
  return first(db, `SELECT * FROM gv1_outcomes o
    WHERE o.outcome_group_id=? AND o.status NOT IN ('rejected','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_outcomes n WHERE n.supersedes_outcome_id=o.outcome_id)
    ORDER BY o.version_no DESC LIMIT 1`, groupId);
}

export async function listCare(db, bmrId, { history = false, limit = 100 } = {}) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 100));
  const recWhere = history ? '' : ` AND r.status NOT IN ('declined','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_recommendations n WHERE n.supersedes_recommendation_id=r.recommendation_id)`;
  const planWhere = history ? '' : ` AND p.status NOT IN ('cancelled','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_treatment_plans n WHERE n.supersedes_treatment_plan_id=p.treatment_plan_id)`;
  const outcomeWhere = history ? '' : ` AND o.status NOT IN ('rejected','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_outcomes n WHERE n.supersedes_outcome_id=o.outcome_id)`;
  const recommendations = await all(db, `SELECT * FROM gv1_recommendations r WHERE r.bmr_id=?${recWhere} ORDER BY r.created_at,r.recommendation_id LIMIT ?`, bmrId, safeLimit);
  const treatment_plans = await all(db, `SELECT * FROM gv1_treatment_plans p WHERE p.bmr_id=?${planWhere} ORDER BY p.created_at,p.treatment_plan_id LIMIT ?`, bmrId, safeLimit);
  const treatment_items = await all(db, `SELECT i.* FROM gv1_treatment_plan_items i JOIN gv1_treatment_plans p ON p.treatment_plan_id=i.treatment_plan_id WHERE p.bmr_id=? ORDER BY i.created_at,i.treatment_plan_item_id LIMIT ?`, bmrId, safeLimit);
  const treatment_events = await all(db, `SELECT * FROM gv1_treatment_events WHERE bmr_id=? ORDER BY occurred_at,treatment_event_id LIMIT ?`, bmrId, safeLimit);
  const outcomes = await all(db, `SELECT * FROM gv1_outcomes o WHERE o.bmr_id=?${outcomeWhere} ORDER BY o.measured_at,o.outcome_id LIMIT ?`, bmrId, safeLimit);
  const feedback = await all(db, `SELECT * FROM gv1_feedback WHERE bmr_id=? ORDER BY created_at,feedback_id LIMIT ?`, bmrId, safeLimit);
  return { recommendations, treatment_plans, treatment_items, treatment_events, outcomes, feedback };
}
