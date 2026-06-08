#!/bin/bash
echo "🚀 Deploying canisters..."
dfx deploy

echo "📝 Fixing declarations..."
python3 -c "
open('src/declarations/health_exchange_backend/health_exchange_backend.did.js','w').write('''export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({ Patient: IDL.Null, Researcher: IDL.Null });
  const Notification = IDL.Record({
    researcher_id: IDL.Text,
    message: IDL.Text,
    status: IDL.Text,
  });
  const UserProfile = IDL.Record({
    role: UserRole,
    name: IDL.Text,
    age: IDL.Nat32,
    diseases: IDL.Text,
    authorized_viewers: IDL.Vec(IDL.Text),
    notifications: IDL.Vec(Notification),
    medical_scans: IDL.Vec(IDL.Text),
  });
  const Result = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text });
  const ResultProfile = IDL.Variant({ Ok: UserProfile, Err: IDL.Text });
  return IDL.Service({
    save_profile: IDL.Func([UserProfile], [Result], []),
    get_profile: IDL.Func([IDL.Text], [ResultProfile], [\"query\"]),
    request_access: IDL.Func([IDL.Text, IDL.Text], [Result], []),
    grant_access: IDL.Func([IDL.Text], [Result], []),
    get_all_patients_anonymized: IDL.Func([], [IDL.Vec(UserProfile)], [\"query\"]),
    get_full_patient_data: IDL.Func([IDL.Text], [ResultProfile], [\"query\"]),
    add_medical_scan: IDL.Func([IDL.Text], [Result], []),
    check_eligibility: IDL.Func([IDL.Nat32, IDL.Text], [IDL.Vec(IDL.Text)], [\"query\"]),
  });
};
export const init = ({ IDL }) => { return []; };
''')
"

echo "🌐 Setting port 4943 public..."
gh codespace ports visibility 4943:public -c $CODESPACE_NAME

echo "✅ Done! Now run: cd src/health_exchange_frontend && npm run start"
