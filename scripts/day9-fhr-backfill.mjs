import fs from 'node:fs/promises';
import { validateHistoricalRow } from '../worker/domain/founder-history-service.js';

const args=process.argv.slice(2), input=args[args.indexOf('--input')+1];
if(!input)throw new Error('Usage: npm run day9:import:dry-run -- --input .local/day9-founder-identity-input.json');
const manifest=JSON.parse(await fs.readFile(input,'utf8'));
const plans=[];
for(const row of Array.isArray(manifest.rows)?manifest.rows:[]){
  const result=await validateHistoricalRow(row);
  plans.push({source_row_key:result.normalized.source_row_key||'invalid',disposition:result.valid&&result.normalized.import_disposition!=='source_pending'?'ready':'quarantine',reasons:result.valid?[]:(result.issues||[]),expected_evidence_count:result.valid?1:0,expected_observation_count:result.valid?result.normalized.observations.length:0,source_checksum_status:/^[a-f0-9]{64}$/.test(result.normalized.source_artifact_checksum)?'valid':'missing_or_invalid',email:'[REDACTED]',source_narrative:'[REDACTED]'});
}
process.stdout.write(`${JSON.stringify({dry_run:true,mutated:false,rows:plans},null,2)}\n`);
