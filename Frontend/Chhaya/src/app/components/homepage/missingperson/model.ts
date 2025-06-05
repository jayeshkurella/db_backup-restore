// Define the interface for the ConfirmMatchData type
export interface ConfirmMatchData {
    match_id: string;  // Match ID
    missing_person_name: string;  // Missing person's name
    confirmed_by_name: string;  // Confirmed by (person's name)
    confirmed_by_contact: string;  // Contact information
    confirmed_by_relationship: string;  // Relationship to the missing person
    notes: string;  // Additional notes
    is_confirmed: boolean;  // Whether the match is confirmed
  }
  