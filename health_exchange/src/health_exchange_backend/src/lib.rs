use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use ic_stable_structures::storable::Bound;
use std::borrow::Cow;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// =========================================================================
// 1. DATA STRUCTURES
// =========================================================================

#[derive(CandidType, Deserialize, Clone)]
pub struct PatientProfile {
    pub owner: Principal,
    pub name: String,
    pub blood_type: String,
    pub allergies: String,
    pub authorized_researchers: Vec<Principal>, // 👈 NEW: Array of approved IDs
    pub created_at: u64,
}

impl Storable for PatientProfile {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
    
    const BOUND: Bound = Bound::Bounded {
        max_size: 2048, // 👈 Increased to 2KB to make room for the array of IDs
        is_fixed_size: false,
    };
}

// =========================================================================
// 2. MEMORY SETUP
// =========================================================================

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static PATIENT_PROFILES: RefCell<StableBTreeMap<Principal, PatientProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
}

// =========================================================================
// 3. API FUNCTIONS
// =========================================================================

#[update]
fn create_profile(name: String, blood_type: String, allergies: String) -> String {
    let caller = ic_cdk::caller();

    if caller == Principal::anonymous() {
        return "Error: Anonymous users cannot create profiles.".to_string();
    }

    let new_profile = PatientProfile {
        owner: caller,
        name,
        blood_type,
        allergies,
        authorized_researchers: Vec::new(), // 👈 Starts empty
        created_at: ic_cdk::api::time(),
    };

    PATIENT_PROFILES.with(|p| {
        p.borrow_mut().insert(caller, new_profile);
    });

    "Profile created securely on-chain!".to_string()
}

#[query]
fn get_my_profile() -> Option<PatientProfile> {
    let caller = ic_cdk::caller();
    PATIENT_PROFILES.with(|p| p.borrow().get(&caller))
}

// =========================================================================
// 4. ACCESS CONTROL FUNCTIONS (PHASE 3)
// =========================================================================

#[update]
fn grant_access(researcher: Principal) -> String {
    let caller = ic_cdk::caller();
    PATIENT_PROFILES.with(|p| {
        let mut db = p.borrow_mut();
        if let Some(mut profile) = db.get(&caller) {
            
            // Check if they already have access to avoid duplicates
            if !profile.authorized_researchers.contains(&researcher) {
                profile.authorized_researchers.push(researcher);
                db.insert(caller, profile); // Save changes to DB
                "Access successfully granted!".to_string()
            } else {
                "Error: Researcher already has access.".to_string()
            }
            
        } else {
            "Error: Profile not found.".to_string()
        }
    })
}

#[update]
fn revoke_access(researcher: Principal) -> String {
    let caller = ic_cdk::caller();
    PATIENT_PROFILES.with(|p| {
        let mut db = p.borrow_mut();
        if let Some(mut profile) = db.get(&caller) {
            
            // Remove the researcher from the array
            profile.authorized_researchers.retain(|&r| r != researcher);
            db.insert(caller, profile); // Save changes to DB
            "Access successfully revoked!".to_string()
            
        } else {
            "Error: Profile not found.".to_string()
        }
    })
}