export interface IGarage{
    garageName : string;
    garageImage : string;
    description : string;
    location : string;
    latitude? : string;
    longitude? : string;
    availableSlots : string[];
    services : string[];
}