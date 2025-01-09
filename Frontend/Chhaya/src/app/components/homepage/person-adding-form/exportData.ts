export class MissingPerson {
    full_name: string = '';
    gender: string = '';
    blood_group: string = '';
    date_of_birth: string = '';
    age: number | null = 0;
    time_of_birth: string | null = '';
    place_of_birth: string = '';
    height: number = 0;
    weight: number = 0;
    complexion: string = '';
    hair_color: string = '';
    hair_type: string = '';
    eye_color: string = '';
    birth_mark: string = '';
    distinctive_mark: string = '';
  
    address: {
      street: string;
      apartment_number?: string;
      village?: string;
      city: string;
      district?: string;
      state: string;
      postal_code: string;
      country: string;
      type: string;
      subtype: string;
      landmark_details?: string;
      location?: { lat: number; lon: number };
    } = {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      type: '',
      subtype: ''
    };
  
    contact: {
      phone_number: string;
      email: string;
      type: string;
      subtype: string;
      subtype_detail?: string;
      location?: string;
      company_name?: string;
      job_title?: string;
      website?: string;
      social_media_handles?: string;
      is_primary: boolean;
    } = {
      phone_number: '',
      email: '',
      type: '',
      subtype: '',
      is_primary: false
    };
  
    missing_time: string = '';
    missing_date: string = '';
    location_details: string = '';
    last_seen_location: string = '';
    missing_location?: { lat: number; lon: number };
  
    fir_number: number = 0;
    fir_photo?: string;
    case_status: string = '';
  
    reportingperson_name: string = '';
    relationship_with_victim: string = '';
    contact_numbers: string = '';
    email_address: string = '';
    willing_to_volunteer: boolean = false;
    
    constructor() {}
  }
  