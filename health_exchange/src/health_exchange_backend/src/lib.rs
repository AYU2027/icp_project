mod models;
mod state;
mod controllers;

use models::UserProfile;

#[ic_cdk::query]
fn get_profile(principal_str: String) -> Result<UserProfile, String> {
    controllers::get_profile_logic(principal_str)
}

#[ic_cdk::update]
fn save_profile(profile: UserProfile) -> Result<(), String> {
    controllers::save_profile_logic(profile)
}

#[ic_cdk::update]
fn request_access(patient_principal: String, message: String) -> Result<(), String> {
    controllers::request_access_logic(patient_principal, message)
}

#[ic_cdk::query]
fn get_all_patients_anonymized() -> Vec<UserProfile> {
    controllers::get_all_patients_anonymized_logic()
}

#[ic_cdk::update]
fn grant_access(researcher_id: String) -> Result<(), String> {
    controllers::grant_access_logic(researcher_id)
}

#[ic_cdk::query]
fn get_full_patient_data(patient_id: String) -> Result<UserProfile, String> {
    controllers::get_full_patient_data_logic(patient_id)
}