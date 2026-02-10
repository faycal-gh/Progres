# Contributing to University Specialties

The recommendation engine depends on accurate data about universities, fields, and available specialties. This guide explains how to add or update this data.

## Data Structure Overview

All academic data is stored in `backend/src/main/resources/data/academic-structure.json`.
This file is a JSON object mapping university codes to their specific academic structures.

### Hierarchy

```
universities
└── university_key (lowercase with underscores, e.g., "universite_xyz_ville")
    ├── name, nameAr, description
    └── fields[]
        ├── code, name, nameAr, description
        ├── levels
        │   ├── L1 → { name, type, nextOptions[] }
        │   ├── L2 → { majors[] }
        │   │         └── { code, name, nameAr, nextOptions[] }
        │   └── L3 → { specialities[] }
        │             └── { code, name, nameAr, parentMajor, masterOptions[] }
        └── masterSpecialities[]
            └── { code, name, nameAr, parentSpeciality }
```

## How to Add a New University

1.  Open `backend/src/main/resources/data/academic-structure.json`.
2.  Add a new key under `universities` using **lowercase with underscores** (e.g., `universite_xyz_ville`).
    - This format is required because the backend normalizes university names from the PROGRES API (removing accents, converting to lowercase, replacing spaces with underscores) to match these keys.
3.  Define the fields and their structure.

### Example JSON Snippet

```json
"universite_des_sciences_xyz_ville": {
  "name": "Université des Sciences XYZ",
  "nameAr": "جامعة العلوم",
  "description": "XYZ University academic structure.",
  "fields": [
    {
      "code": "ST",
      "name": "Sciences et Technologies",
      "nameAr": "علوم وتكنولوجيا",
      "description": "Science and Technology field",
      "levels": {
        "L1": {
          "name": "1ère année Licence",
          "type": "common_core",
          "nextOptions": ["L2_GM", "L2_ELT"]
        },
        "L2": {
          "majors": [
            {
              "code": "L2_GM",
              "name": "Génie Mécanique",
              "nameAr": "هندسة ميكانيكية",
              "nextOptions": ["L3_CM", "L3_SDM"]
            }
          ]
        },
        "L3": {
          "specialities": [
            {
              "code": "L3_CM",
              "name": "Construction Mécanique",
              "nameAr": "بناء ميكانيكي",
              "parentMajor": "L2_GM",
              "masterOptions": ["M_CIM", "M_FAB"]
            }
          ]
        }
      },
      "masterSpecialities": [
        {
          "code": "M_CIM",
          "name": "Conception et Industrialisation en Mécanique",
          "nameAr": "تصميم وتصنيع ميكانيكي",
          "parentSpeciality": "L3_CM"
        }
      ]
    }
  ]
}
```

## How to Add a New Specialty

### Adding an L3 Specialty

1.  Locate the relevant **Field** → `levels.L3.specialities` array.
2.  Add a new entry with:
    *   `code`: Unique identifier (e.g., `L3_NEW`).
    *   `name`: French name.
    *   `nameAr`: Arabic name.
    *   `parentMajor`: The code of the L2 major that leads to this.
    *   `masterOptions`: Array of Master codes available after this L3.

### Adding a Master's Specialty

Master's specialities are stored at the **field level** in the `masterSpecialities` array (not inside L3):

1.  Locate the relevant **Field** → `masterSpecialities` array.
2.  Add a new entry with:
    *   `code`: Unique identifier (e.g., `M_IA`).
    *   `name`: French name.
    *   `nameAr`: Arabic name.
    *   `parentSpeciality`: The L3 specialty code that leads to this Master.
3.  Also add the Master code to the corresponding L3 specialty's `masterOptions` array.

### Example: Adding an AI Master

```json
// 1. Add to field's masterSpecialities array:
{
  "code": "M_IA",
  "name": "Intelligence Artificielle",
  "nameAr": "ذكاء اصطناعي",
  "parentSpeciality": "L3_SI"
}

// 2. Also add "M_IA" to the L3_SI specialty's masterOptions:
{
  "code": "L3_SI",
  "name": "Systèmes Informatiques",
  "nameAr": "أنظمة إعلامية",
  "parentMajor": "L2_INFO",
  "masterOptions": ["M_GL", "M_SIQ", "M_IL", "M_IA"]  // Added M_IA here
}
```

## Recommendation Logic

The AI recommendation engine uses this data to:
1.  Identify what a student is *currently* studying.
2.  Look up valid *next steps* in this JSON file.
3.  Filter options based on the student's current path (e.g., an L2 Mechanical Engineering student will only see L3 Mechanical options).

By keeping this file accurate, the AI can give valid, university-specific advice.
