use crate::models::{UserProfile, UserRole, Notification};
use crate::state::USER_PROFILES;
use ic_cdk::api::msg_caller;

pub fn get_profile_logic(principal_str: String) -> Result<UserProfile, String> {
    USER_PROFILES.with(|p| {
        p.borrow()
            .get(&principal_str)
            .ok_or_else(|| "Profile not found".to_string())
    })
}

pub fn save_profile_logic(profile: UserProfile) -> Result<(), String> {
    let caller = msg_caller().to_text();
    USER_PROFILES.with(|p| {
        p.borrow_mut().insert(caller, profile);
    });
    Ok(())
}

pub fn request_access_logic(patient_principal: String, message: String) -> Result<(), String> {
    let researcher_principal = msg_caller().to_text();
    
    USER_PROFILES.with(|p| {
        let mut profiles = p.borrow_mut();
        if let Some(mut patient_profile) = profiles.get(&patient_principal) {
            let new_notification = Notification {
                researcher_id: researcher_principal,
                message,
                status: "Pending".to_string(),
            };
            patient_profile.notifications.push(new_notification);
            profiles.insert(patient_principal, patient_profile);
            Ok(())
        } else {
            Err("Patient profile not found".to_string())
        }
    })
}

pub fn get_all_patients_anonymized_logic() -> Vec<UserProfile> {
    USER_PROFILES.with(|p| {
        p.borrow()
            .iter()
            .filter(|(_, profile)| profile.role == UserRole::Patient)
            .map(|(id, profile)| UserProfile {
                role: profile.role.clone(),
                name: id.clone(), // Passes the Principal ID string instead of a name
                age: profile.age,
                diseases: profile.diseases.clone(),
                authorized_viewers: vec![], 
                notifications: vec![], 
            })
            .collect()
    })
}

pub fn grant_access_logic(researcher_id: String) -> Result<(), String> {
    let patient_principal = ic_cdk::api::msg_caller().to_text();
    
    USER_PROFILES.with(|p| {
        let mut profiles = p.borrow_mut();
        if let Some(mut profile) = profiles.get(&patient_principal) {
            
            // 1. Change the notification status from Pending to Approved
            for note in profile.notifications.iter_mut() {
                if note.researcher_id == researcher_id && note.status == "Pending" {
                    note.status = "Approved".to_string();
                }
            }
            
            // 2. Add the researcher to the authorized viewers list
            if !profile.authorized_viewers.contains(&researcher_id) {
                profile.authorized_viewers.push(researcher_id);
            }
            
            profiles.insert(patient_principal, profile);
            Ok(())
        } else {
            Err("Patient profile not found".to_string())
        }
    })
}

pub fn get_full_patient_data_logic(patient_id: String) -> Result<UserProfile, String> {
    let caller = ic_cdk::api::msg_caller().to_text();
    
    USER_PROFILES.with(|p| {
        if let Some(profile) = p.borrow().get(&patient_id) {
            // SECURITY CHECK: Is the caller in the authorized_viewers list?
            if profile.authorized_viewers.contains(&caller) {
                Ok(profile.clone()) // Return the full, real data
            } else {
                Err("Access Denied. You do not have permission to view this data.".to_string())
            }
        } else {
            Err("Patient not found".to_string())
        }
    })
}