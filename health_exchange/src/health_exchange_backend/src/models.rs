use candid::{CandidType, Decode, Deserialize, Encode};
use ic_stable_structures::{storable::Bound, Storable};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum UserRole {
    Patient,
    Researcher,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Notification {
    pub researcher_id: String,
    pub message: String,
    pub status: String, // "Pending", "Approved", "Rejected"
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UserProfile {
    pub role: UserRole,
    pub name: String,
    pub age: u32,
    pub diseases: String,
    pub authorized_viewers: Vec<String>,
    pub notifications: Vec<Notification>,
    pub medical_scans: Vec<String>,
}

impl Storable for UserProfile {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    // Handles unbounded memory sizing for the new library version
    const BOUND: Bound = Bound::Unbounded; 
}