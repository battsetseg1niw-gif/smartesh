# SmartESH v70 Deployment Candidate QA

- JavaScript syntax: PASS for app.js, role-preview-v70.js, deploy-readiness-v70.js.
- Navigation target integrity: every `data-view` target exists.
- Student test exit hotfix v68 retained.
- Student Learning Center + adaptive learning v64/v65 retained.
- Teacher Learning Center navigation restored.
- Teacher Paper Scanner navigation moved to production-safe v44 scanner intake.
- Student / Teacher / Admin QA preview unified. Public production hides preview controls unless `?qa=1`.
- Admin Learning Center preview link added.
- Scanner copy no longer claims demo scoring; unverified OMR never fabricates scores.
- Previously inert Paper Scanner weak-topic button now gives a clear prerequisite message or opens Practice.
- Consolidated pending migration added: `production/v70_deploy_update.sql`.

Known external dependencies:
- Real OMR/CV backend is not implemented.
- QPay Merchant production credentials/approval are external and must be configured server-side.
- Official previous-exam answer keys must be verified before scoring/publishing.
