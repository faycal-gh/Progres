# PROGRES API Documentation

**Ministère de l'Enseignement Supérieur et de la Recherche Scientifique**  
Direction des réseaux et du développement du numérique

---

## Authentication

### Endpoint
```
POST https://progres.mesrs.dz/api/authentication/v1/
```

### Request Parameters
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| username | String | Body | User's username |
| password | String | Body | User's password |

### Response
Returns an authentication token that must be used in all subsequent API requests.

### Usage
Add the authentication token to the request headers:
- **Header Key**: `Authorization`
- **Header Value**: `{token}`

---

## API Endpoints

### 1. Get Student's Baccalaureate Grades

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/notes
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/notes
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| matriculeBac | String | Baccalaureate registration number |
| Note | Double | Grade |
| refCodeMatiere | String | Subject code |
| refCodeMatiereLibelleFr | String | Subject name in French |
| AnneeBac | String | Baccalaureate year |

**Note**: Only non-null values are returned.

---

### 2. Get Complete Student Baccalaureate Information

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| Id | Long | Record ID |
| Nin | String | National identification number |
| Matricule | Double | Registration number |
| nomAr | String | Last name (Arabic) |
| prenomAr | String | First name (Arabic) |
| nomFr | String | Last name (French) |
| prenomFr | String | First name (French) |
| dateNaissance | Date | Date of birth |
| moyenneBac | String | Baccalaureate average |
| prenomPere | String | Father's first name |
| nomPrenomMere | String | Mother's full name |
| Telephone | String | Phone number |
| adresseResidence | String | Residential address |
| refCodeSexe | String | Gender code |
| refCodeWilayaNaissance | String | Birth province code |
| refCodeWilayaBac | String | Baccalaureate province code |
| refCodeWilayaResidence | String | Residence province code |
| refCodeSerieBac | String | Baccalaureate series code |
| libelleVilleNaissance | String | Birth city name |
| libelleSerieBac | String | Baccalaureate series name |
| tag | int | Tag |
| idImportation | int | Import ID |
| idImportationAffectation | int | Assignment import ID |
| idDossierEtudiant | int | Student file ID |
| annee | String | Year |
| estClassique | Boolean | Is classic |
| refCodeEtablissement | String | Institution code |
| refCodeFiliere | String | Field of study code |
| numeroChoix | String | Choice number |
| noteAffectation | String | Assignment grade |
| refCodeEtablissementRecours | String | Appeal institution code |
| refCodeFiliereRecours | String | Appeal field code |
| refCodeEtablissementOrientation | String | Orientation institution code |
| refCodeFiliereOrientation | String | Orientation field code |
| refCodeTypeAffectation | String | Assignment type code |
| refCodeEtablissementAffectation | String | Assignment institution code |
| refCodeFiliereAffectation | String | Assignment field code |
| libelleFiliereAffectation | String | Assignment field name |
| codeFiliereInscription | String | Registration field code |
| photoEtudiant | String | Student photo |
| photo | String | Photo |
| anneeBac | String | Baccalaureate year |
| estMigree | Boolean | Is migrated |
| affectationModifiee | Boolean | Assignment modified |
| soumiTest | Boolean | Subject to test |
| idResultatTest | Integer | Test result ID |
| resultatTest | String | Test result |
| statutAffectation | Integer | Assignment status |
| notesBacheliers | List | List of baccalaureate grades |

**Note**: Only non-null values are returned.

---

### 3. Get Student's Pedagogical Groups by Administrative Registration

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/dia/{idDia}/groups
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/dia/6150897/groups
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| idDia | Long (Path) | Administrative registration file ID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| Id | Long | Record ID |
| dossierInscriptionId | Long | Registration file ID |
| dossierEtudiantId | Long | Student file ID |
| individuId | Long | Individual ID |
| individuIdentifiant | String | Individual identifier |
| nomEtudiant | String | Student last name |
| prenomEtudiant | String | Student first name |
| nomEtudiantArabe | String | Student last name (Arabic) |
| prenomEtudiantArabe | String | Student first name (Arabic) |
| numeroMatricule | String | Registration number |
| numeroInscription | String | Enrollment number |
| etudiantCivilite | String | Student civility |
| urlPhoto | String | Photo URL |
| etudiantSexe | String | Student gender |
| groupePedagogiqueId | Long | Pedagogical group ID |
| codeGroupePedagogique | String | Pedagogical group code |
| nomGroupePedagogique | String | Pedagogical group name |
| idSection | Long | Section ID |
| codeSection | String | Section code |
| nomSection | String | Section name |
| refGroupeId | Long | Reference group ID |
| dateAffectation | Date | Assignment date |
| dateNaissanceEtudiant | Date | Student's date of birth |
| moyenneBac | Double | Baccalaureate average |
| lastMoyenne | Double | Last average |
| periodeId | Integer | Period ID |
| periodeCode | String | Period code |
| periodeLibelleLongLt | String | Period long label |

**Note**: Only non-null values are returned.

---

### 4. Get Student's Administrative Registrations

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/dias
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/dias
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| numeroInscription | String | Enrollment number |
| anneeAcademiqueId | Integer | Academic year ID |
| anneeAcademiqueCode | String | Academic year code |
| refLibelleTypeInscription | String | Registration type label |
| refLibelleNatureInscription | String | Registration nature label |
| refLibelleStatutEtudiant | String | Student status label |
| rang | Integer | Rank |
| estClassique | Boolean | Is classic |
| situationId | Integer | Situation ID |
| situationLibelleFr | String | Situation label (French) |
| situationLibelleAr | String | Situation label (Arabic) |
| dossierId | Long | File ID |
| dossierEtudiantId | Long | Student file ID |
| numeroMatricule | String | Registration number |
| resultRefCodeDomaine | String | Result domain code |
| resultRefCodeFiliere | String | Result field code |
| resultRefCodeSpecialite | String | Result specialty code |
| ouvertureOffreFormationId | Integer | Training offer opening ID |
| offreFormationId | Integer | Training offer ID |
| offreFormationCode | String | Training offer code |
| offreFormationLibelleFr | String | Training offer label (French) |
| offreFormationLibelleAr | String | Training offer label (Arabic) |
| refCodeCycle | String | Cycle code |
| refCodeNiveau | String | Level code |
| refLibelleCycle | String | Cycle label |
| refLibelleCycleAr | String | Cycle label (Arabic) |
| refLibelleNiveau | String | Level label |
| dateInscription | Date | Registration date |
| centreScolarite | String | Academic center |
| typeDossier | String | File type |
| typeDossierLibelleFr | String | File type label (French) |
| typeDossierLibelleAr | String | File type label (Arabic) |
| dateCreation | Date | Creation date |
| exclusionId | Long | Exclusion ID |
| congeAcademiqueId | Long | Academic leave ID |
| estMigree | Boolean | Is migrated |
| idDomaine | Integer | Domain ID |
| codeDomaine | String | Domain code |
| libelleCodeDomaine | String | Domain code label |
| llDomaine | String | Domain label |
| llDomaineArabe | String | Domain label (Arabic) |
| idFiliere | Integer | Field ID |
| codeFiliere | String | Field code |
| llFiliereArabe | String | Field label (Arabic) |
| llFiliere | String | Field label |
| libelleCodeFiliere | String | Field code label |
| ofIdDomaine | Integer | Offer domain ID |
| ofCodeDomaine | String | Offer domain code |
| ofLlDomaine | String | Offer domain label |
| ofLlDomaineArabe | String | Offer domain label (Arabic) |
| ofIdFiliere | Integer | Offer field ID |
| ofCodeFiliere | String | Offer field code |
| ofLlFiliereArabe | String | Offer field label (Arabic) |
| ofLlFiliere | String | Offer field label |
| ofIdSpecialite | Integer | Offer specialty ID |
| ofCodeSpecialite | String | Offer specialty code |
| ofLlSpecialiteArabe | String | Offer specialty label (Arabic) |
| ofLlSpecialite | String | Offer specialty label |
| ofLibelleCodeSpecialite | String | Offer specialty code label |
| photoEtudiant | String | Student photo |
| individuId | Long | Individual ID |
| nin | String | National identification number |
| individuNomArabe | String | Individual last name (Arabic) |
| individuNomLatin | String | Individual last name (Latin) |
| individuPrenomArabe | String | Individual first name (Arabic) |
| individuPrenomLatin | String | Individual first name (Latin) |
| individuDateNaissance | Date | Individual date of birth |
| individuLieuNaissance | String | Individual place of birth |
| individuLieuNaissanceArabe | String | Individual place of birth (Arabic) |
| individuNationaliteLibelleLongFr | String | Individual nationality (French) |
| individuNationaliteLibelleLongAr | String | Individual nationality (Arabic) |
| individuSituationFamilialeLibelleLongFr | String | Individual family situation (French) |
| IndividuServiceNationalLibelleLongFr | String | Individual national service (French) |
| individuGroupeSanguinLibelleLongFr | String | Individual blood group (French) |
| individuNomMereLatin | String | Mother's last name (Latin) |
| individuPrenomMereLatin | String | Mother's first name (Latin) |
| individuPrenomPereLatin | String | Father's first name (Latin) |
| individuSituationFamilialeLibelleLongAr | String | Individual family situation (Arabic) |
| individuServiceNationalLibelleLongAr | String | Individual national service (Arabic) |
| individuGroupeSanguinLibelleLongAr | String | Individual blood group (Arabic) |
| individuNomMereArabe | String | Mother's last name (Arabic) |
| individuPrenomMereArabe | String | Mother's first name (Arabic) |
| individuPrenomPereArabe | String | Father's first name (Arabic) |
| individuCiviliteLibelleLongFr | String | Individual civility (French) |
| individuCiviliteLibelleLongAr | String | Individual civility (Arabic) |
| individuWilayaNaissanceLibelleLongFr | String | Individual birth province (French) |
| individuWilayaNaissanceLibelleLongAr | String | Individual birth province (Arabic) |
| individuWilayaNaissanceCode | String | Individual birth province code |
| individuWilayaNaissanceId | Integer | Individual birth province ID |
| refLibelleNiveauArabe | String | Level label (Arabic) |
| refLibelleDomaineArabe | String | Domain label (Arabic) |
| refLibelleFiliereArabe | String | Field label (Arabic) |
| refLibelleSpecialiteArabe | String | Specialty label (Arabic) |
| refEtablissementId | Integer | Institution ID |
| refCodeEtablissement | String | Institution code |
| llEtablissementArabe | String | Institution label (Arabic) |
| llEtablissementLatin | String | Institution label (Latin) |
| individuibelleWilayaNaissance | String | Individual birth province label |
| refCodeWilayaNaissance | String | Birth province code |
| adresseResidence | String | Residential address |
| dossierBachelierId | Long | Baccalaureate file ID |
| matriculeBac | String | Baccalaureate registration number |
| moyenneBac | double | Baccalaureate average |
| telephoneBachelier | String | Baccalaureate holder phone |
| adresseResidenceBachelier | String | Baccalaureate holder address |
| anneeBac | String | Baccalaureate year |
| lastMoyenne | double | Last average |
| photo | String | Photo |
| refCodeSexeBachelier | String | Baccalaureate holder gender code |
| refCodeWilayaNaissanceBachelier | String | Baccalaureate holder birth province code |
| refCodeWilayaBacBachelier | String | Baccalaureate holder bac province code |
| refCodeWilayaResidenceBachelier | String | Baccalaureate holder residence province code |
| libelleVilleNaissanceBachelier | String | Baccalaureate holder birth city label |
| refCodeSerieBacBachelier | String | Baccalaureate holder series code |
| libelleSerieBacBachelier | String | Baccalaureate holder series label |
| refCodeFiliereBachelier | String | Baccalaureate holder field code |
| numeroChoixBachelier | String | Baccalaureate holder choice number |
| noteAffectationBachelier | String | Baccalaureate holder assignment grade |
| refCodeEtablissementRecoursBachelier | String | Baccalaureate holder appeal institution code |
| refCodeFiliereRecoursBachelier | String | Baccalaureate holder appeal field code |
| refCodeEtablissementOrientationBachelier | String | Baccalaureate holder orientation institution code |
| refCodeFiliereOrientationBachelier | String | Baccalaureate holder orientation field code |
| refCodeTypeAffectationBachelier | String | Baccalaureate holder assignment type code |
| refCodeEtablissementAffectationBachelier | String | Baccalaureate holder assignment institution code |
| refCodeFiliereAffectationBachelier | String | Baccalaureate holder assignment field code |
| cycleId | Integer | Cycle ID |
| cycleCode | String | Cycle code |
| cycleLibelleLongLt | String | Cycle long label |
| cycleLibelleLongAr | String | Cycle long label (Arabic) |
| niveauId | Integer | Level ID |
| niveauCode | String | Level code |
| niveauRang | Integer | Level rank |
| niveauLibelleLongLt | String | Level long label |
| niveauLibelleLongAr | String | Level long label (Arabic) |
| herbergementDemande | Boolean | Accommodation requested |
| bourseDemandee | Boolean | Scholarship requested |
| idTypeDemandeHebergement | Integer | Accommodation request type ID |
| typeDemandeHebergementLibelleFr | String | Accommodation request type (French) |
| typeDemandeHebergementLibelleAr | String | Accommodation request type (Arabic) |
| idTypeDemandeBourse | Integer | Scholarship request type ID |
| typeDemandeBourseLibelleFr | String | Scholarship request type (French) |
| typeDemandeBourseLibelleAr | String | Scholarship request type (Arabic) |
| observationScolariteHebergement | String | Accommodation academic observation |
| observationScolaritBourse | String | Scholarship academic observation |
| herbergementAccorde | Boolean | Accommodation granted |
| bourseAccordee | Boolean | Scholarship granted |
| idTypeHebergement | Integer | Accommodation type ID |
| typeHebergementLibelleFr | String | Accommodation type (French) |
| typeHebergementLibelleAr | String | Accommodation type (Arabic) |
| lieuHebergement | String | Accommodation location |
| ancienneteHebergement | Integer | Accommodation seniority |
| observationOnouHebergement | String | ONOU accommodation observation |
| observationOnouBourse | String | ONOU scholarship observation |
| montantBourse | Float | Scholarship amount |
| ancienneteBourse | Integer | Scholarship seniority |

**Note**: Only non-null values are returned.

---

### 5. Get Student's Academic Leave by Academic Year

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/anneeAcademique/{idAnneeAcademiqe}/congeacademique
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/anneeAcademique/16/congeacademique
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |
| idAnneeAcademiqe | Integer (Path) | Academic year ID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| ouvertureOffreFormationId | Integer | Training offer opening ID |
| libelleOffreFormationFr | String | Training offer label (French) |
| libelleOffreFormationAr | String | Training offer label (Arabic) |
| cycleId | Integer | Cycle ID |
| cycleCode | String | Cycle code |
| cycleLibelleLongLt | String | Cycle long label |
| cycleLibelleLongAr | String | Cycle long label (Arabic) |
| niveauId | Integer | Level ID |
| niveauCode | String | Level code |
| niveauRang | Integer | Level rank |
| niveauLibelleLongLt | String | Level long label |
| niveauLibelleLongAr | String | Level long label (Arabic) |
| idDossierEtudiant | Long | Student file ID |
| idEtablissement | Integer | Institution ID |
| dossierInscriptionId | Long | Registration file ID |
| dossierEtudiantMatricule | String | Student file registration number |
| dateDemande | Date | Request date |
| dateDebutDemande | Date | Request start date |
| dateFinDemande | Date | Request end date |
| resultat | Boolean | Result |
| dateResultat | Date | Result date |
| dateDebutAccordee | Date | Granted start date |
| dateFinAccordee | Date | Granted end date |
| decisionOnouValide | Boolean | ONOU decision validated |
| etudiantSexe | String | Student gender |
| etudiantCivilite | String | Student civility |
| dateDecisionOnou | Date | ONOU decision date |
| ncMotifRefusId | Integer | Refusal reason ID |
| ncMotifRefusLibelleLongFr | String | Refusal reason (French) |
| dateReintegration | Date | Reinstatement date |
| ncTypeCongeId | Integer | Leave type ID |
| ncTypeCongeLibelleLongFr | String | Leave type (French) |
| situationId | Integer | Situation ID |
| libelleSituation | String | Situation label |
| demandeValidee | Boolean | Request validated |
| resultatValide | Boolean | Result validated |
| reintegrationValidee | Boolean | Reinstatement validated |
| dateValidationDemande | Date | Request validation date |
| dateValidationResultat | Date | Result validation date |
| dateValidationReintegration | Date | Reinstatement validation date |
| dateDemandeReintegration | Date | Reinstatement request date |
| dateResultatReintegration | Date | Reinstatement result date |
| individuId | Integer | Individual ID |
| individuNin | String | Individual NIN |
| EtudiantNomArabe | String | Student last name (Arabic) |
| EtudiantNomLatin | String | Student last name (Latin) |
| EtudiantPrenomArabe | String | Student first name (Arabic) |
| EtudiantPrenomLatin | String | Student first name (Latin) |
| EtudiantDateNaissance | Date | Student date of birth |
| EtudiantLieuNaissance | String | Student place of birth |
| anneeAcademiqueId | Integer | Academic year ID |
| anneeAcademiqueCode | String | Academic year code |
| anneeAcademiquePremiereAnnee | Short | Academic year first year |
| anneeAcademiqueDeuxiemeAnnee | Short | Academic year second year |
| anneeAcademiqueReintegrationId | Integer | Reinstatement academic year ID |
| anneeAcademiqueReintegrationCode | String | Reinstatement academic year code |
| anneeAcademiqueReintegrationPremiereAnnee | Short | Reinstatement academic year first year |
| anneeAcademiqueReintegrationDeuxiemeAnnee | Short | Reinstatement academic year second year |
| bacId | Integer | Baccalaureate ID |
| bacMatricule | String | Baccalaureate registration number |
| bacRefCodeSerie | String | Baccalaureate series code |
| bacLibelleSerie | String | Baccalaureate series label |
| observation | String | Observation |
| ncMotifRefusReintegrationId | Integer | Reinstatement refusal reason ID |
| ncMotifRefusReintegrationLibelleLongFr | String | Reinstatement refusal reason (French) |

**Note**: Only non-null values are returned.

---

## Important Notes

1. All endpoints require authentication using the token obtained from the authentication endpoint
2. The token must be included in the `Authorization` header for all requests
3. All endpoints return only non-null values
4. Base URL: `https://progres.mesrs.dz/api/`
5. All dates follow standard date format
6. Response data is in JSON format

---

## Error Handling

Please ensure proper error handling for:
- Invalid authentication credentials
- Expired tokens
- Invalid UUIDs or IDs
- Missing required parameters
- Network connectivity issues

---

---

### 6. Get Student's Personal Information

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/individu
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/individu
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Individual ID |
| identifiant | String | Identifier |
| dateNaissance | Date | Date of birth |
| nomArabe | String | Last name (Arabic) |
| nomLatin | String | Last name (Latin) |
| prenomArabe | String | First name (Arabic) |
| prenomLatin | String | First name (Latin) |
| lieuNaissance | String | Place of birth |
| lieuNaissanceArabe | String | Place of birth (Arabic) |
| photo | String | Photo |
| email | String | Email address |

**Note**: Only non-null values are returned.

---

### 7. Get Student's Academic Report by Academic Year

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/dias/{idDia}/periode/bilans
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/dias/6845626/periode/bilans
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |
| idDia | Long (Path) | Administrative registration file ID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| type | int | Type |
| oofId | Integer | Training offer opening ID |
| offreFormationLibelleFr | String | Training offer label (French) |
| offreFormationLibelleAr | String | Training offer label (Arabic) |
| deliberationSessionId | Long | Deliberation session ID |
| periodeId | Integer | Period ID |
| periodeLibelleFr | String | Period label (French) |
| periodeLibelleAr | String | Period label (Arabic) |
| bilanUes | List<BilanUeDto> | List of unit reports |
| bilanMcDtos | List<BilanMcDto> | List of course reports |
| sessions | List<BilanSessionDto> | List of sessions |
| dateDeliberation | Date | Deliberation date |
| bilanSessionDtoMax | BilanSessionDto | Maximum session report |
| dossierInscriptionAdministrativeId | Long | Administrative registration file ID |
| individuId | Long | Individual ID |
| situationId | Integer | Situation ID |
| planningSessionId | Long | Session planning ID |
| psIntitule | String | Planning session title |
| psDateFin | Date | Planning session end date |
| psRefCodeTypeSession | String | Planning session type code |
| nomArabeEtudiant | String | Student last name (Arabic) |
| nomLatinEtudiant | String | Student last name (Latin) |
| prenomArabeEtudiant | String | Student first name (Arabic) |
| prenomLatinEtudiant | String | Student first name (Latin) |
| dateNaissanceEtudiant | Date | Student date of birth |
| lieuNaissanceEtudiant | String | Student place of birth |
| typeDecisionId | Integer | Decision type ID |
| typeDecisionCode | String | Decision type code |
| typeDecisionLibelleFr | String | Decision type label (French) |
| typeDecisionLibelleAr | String | Decision type label (Arabic) |
| mentionId | Integer | Mention ID |
| mentionCode | String | Mention code |
| mentionLibelleFr | String | Mention label (French) |
| mentionLibelleAr | String | Mention label (Arabic) |
| mentionLibelle | String | Mention label |
| anneeAcademiqueId | Integer | Academic year ID |
| anneeAcademiqueCode | String | Academic year code |
| refEtablissementId | Integer | Institution ID |
| refEtablissementCode | String | Institution code |
| refEtablissementLibelleFr | String | Institution label (French) |
| moyenne | Double | Average |
| moyenneSn | Double | Normal session average |
| credit | Double | Credits |
| creditObtenu | Double | Credits obtained |
| creditAcquis | Double | Credits acquired |
| cumulCreditPrecedent | Double | Previous cumulative credits |
| annuel | Boolean | Annual |
| bilanFinal | Boolean | Final report |
| matriculeEtudiant | String | Student registration number |
| numeroInscriptionEtudiant | String | Student enrollment number |
| sessionIntitule | String | Session title |
| cycleId | Integer | Cycle ID |
| cycleCode | String | Cycle code |
| cycleLibelleLongLt | String | Cycle long label |
| niveauId | Integer | Level ID |
| niveauCode | String | Level code |
| niveauRang | int | Level rank |
| niveauLibelleLongLt | String | Level long label |
| niveauLibelleLongAr | String | Level long label (Arabic) |
| creditMinObtenu | Boolean | Minimum credits obtained |
| oldSession | Boolean | Old session |
| bilanSessionDtos | List<BilanSessionDto> | List of session reports |
| dossierEtudiantId | Long | Student file ID |
| moyenneGenerale | Double | General average |
| formattedMG | String | Formatted general average |
| passageL1AvecDette | Boolean | Pass L1 with debt |
| styleClass | String | Style class |
| admis | Boolean | Admitted |
| bilanAnnuels | List<BilanSessionDto> | List of annual reports |
| bilanParentId | Long | Parent report ID |
| columnIntitule | String | Column title |
| urlPhoto | String | Photo URL |
| totalAquis | int | Total acquired |
| effectif | int | Headcount |
| tauxReussite | Double | Success rate |
| sommeMoyenne | Double | Sum of averages |
| moyennePromo | Double | Promotion average |
| moyenneControleContinu | Double | Continuous assessment average |
| noteControleIntermediaire | Double | Intermediate assessment grade |
| noteExamen | Double | Exam grade |
| noteSession | Double | Session grade |
| effectifTauxReussite | String | Headcount success rate |
| addSession1 | Boolean | Add session 1 |
| intituleSession1 | String | Session 1 title |
| moyenneControleContinuSession1 | Double | Session 1 continuous assessment average |
| noteControleIntermediaireSession1 | Double | Session 1 intermediate assessment grade |
| noteExamenSession1 | Double | Session 1 exam grade |
| moyenneGeneraleSession1 | Double | Session 1 general average |
| moyenneControleContinuSession2 | Double | Session 2 continuous assessment average |
| noteControleIntermediaireSession2 | Double | Session 2 intermediate assessment grade |
| noteExamenSession2 | Double | Session 2 exam grade |
| moyenneGeneraleSession2 | Double | Session 2 general average |
| addSession2 | Boolean | Add session 2 |
| intituleSession2 | String | Session 2 title |
| avecControleContinu | Boolean | With continuous assessment |
| avecControleIntermediaire | Boolean | With intermediate assessment |
| coefficientControleContinu | Double | Continuous assessment coefficient |
| coefficientExamen | Double | Exam coefficient |
| coefficient | Double | Coefficient |
| coefficientControleIntermediaire | Double | Intermediate assessment coefficient |
| rattachementMcId | Integer | Course attachment ID |
| estMigree | Boolean | Is migrated |
| dateGeneration | Date | Generation date |
| idDeliberationAnnuel | Long | Annual deliberation ID |
| dateDeliberationSn | Date | Normal session deliberation date |
| dateDeliberationSRattrapage | Date | Makeup session deliberation date |

**Note**: Only non-null values are returned.

---

### 8. Get Student's Academic Report by Semester

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/bac/{uuid}/dia/{idDia}/periode/{idPeriode}/bilan
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/bac/868b3632-21e4-443a-93aa-675aed543889/dia/6845626/periode/2482111/bilan
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |
| idDia | Long (Path) | Administrative registration file ID |
| idPeriode | Long (Path) | Period (semester) ID |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| type | int | Type |
| annuel | Boolean | Annual |
| oof | OuvertureOffreFormation | Training offer opening |
| periode | Periode | Period |
| bilanUes | List<BilanUe> | List of unit reports |
| dossierInscriptionAdministrative | DossierInscriptionAdministrative | Administrative registration file |
| typeDecision | Nomenclature | Decision type |
| moyenne | Double | Average |
| moyenneSn | Double | Normal session average |
| credit | Double | Credits |
| creditObtenu | Double | Credits obtained |
| creditAcquis | Double | Credits acquired |
| cumulCreditPrecedent | Double | Previous cumulative credits |
| coefficient | Double | Coefficient |

**Note**: Only non-null values are returned.

---

### 9. Get Module Coefficients (For TP/CC Detection)

> **️ IMPORTANT**: This endpoint provides the assessment coefficients which can be used to determine if a module has TP/CC (Continuous Assessment) component.

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/offreFormation/{offerId}/niveau/{levelId}/Coefficients
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/offreFormation/5001/niveau/101/Coefficients
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| offerId | Long (Path) | Offer formation ID (from `ouvertureOffreFormationId` in student card) |
| levelId | Long (Path) | Level ID (from `niveauId` in student card) |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| mcLibelleFr | String | Module name (French) |
| mcLibelleAr | String | Module name (Arabic) |
| periodeLibelleFr | String | Period label (French) |
| periodeLibelleAr | String | Period label (Arabic) |
| coefficientControleContinu | Double | Continuous assessment (TD/TP) coefficient weight |
| coefficientControleIntermediaire | Double | Intermediate assessment coefficient weight |
| coefficientExamen | Double | Final exam coefficient weight |

#### TP/CC Detection Logic
```
- If coefficientControleContinu > 0 → Module has CC/TP component
- If coefficientExamen > 0 → Module has final exam
- If coefficientControleContinu = 1.0 and coefficientExamen = 0 → Module is 100% TP/CC
- If coefficientControleContinu = 0.4 and coefficientExamen = 0.6 → Standard module with 40% TD and 60% exam
```

> ** Important Note for Average Calculators**: This endpoint returns **assessment type weights** (how much CC vs Exam contributes to the module grade), NOT the overall module coefficient for calculating semester/year averages.
>
> To get the **module coefficient** (weight of the module in the overall average):
> 1. **Primary source**: Use `coefficient` from the Bilan endpoint (`/bac/{uuid}/dias/{idDia}/periode/bilans` → `bilanMcs[].coefficient`)
> 2. **Fallback source**: Use `rattachementMcCoefficient` from Exam Grades endpoint (`/planningSession/dia/{cardId}/noteExamens`)
> 3. **Last resort**: Allow user to input manually if both sources return 0 or null

**Note**: Only non-null values are returned.

---

### 10. Get Continuous Assessment Grades (CC/TD/TP)

> ** NOTE**: This endpoint returns the actual continuous assessment (contrôle continu) grades separately from exam grades.

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/controleContinue/dia/{cardId}/notesCC
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/controleContinue/dia/6150897/notesCC
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| cardId | Long (Path) | Student card ID (from `id` in StudentCardDto) |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| apCode | String | Academic period code |
| llPeriode | String | Period label (Latin) |
| llPeriodeAr | String | Period label (Arabic) |
| rattachementMcMcLibelleFr | String | Module name (French) |
| rattachementMcMcLibelleAr | String | Module name (Arabic) |
| note | Double | Continuous assessment grade |
| absent | Boolean | Student was absent |
| observation | String | Any observation/notes |
| autorisationDemandeRecours | Boolean | Appeal request authorized |
| dateDebutDepotRecours | Date | Appeal submission start date |
| dateLimiteDepotRecours | Date | Appeal submission deadline |

**Note**: Only non-null values are returned.

---

### 11. Get Exam Grades (Final Examinations)

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/planningSession/dia/{cardId}/noteExamens
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/planningSession/dia/6150897/noteExamens
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| cardId | Long (Path) | Student card ID (from `id` in StudentCardDto) |

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | Long | Record ID |
| idPeriode | Integer | Period ID |
| mcLibelleFr | String | Module name (French) |
| mcLibelleAr | String | Module name (Arabic) |
| noteExamen | Double | Exam grade |
| planningSessionId | Long | Planning session ID |
| planningSessionIntitule | String | Session title (e.g., "Session Normale") |
| rattachementMcCoefficient | Double | Module coefficient |
| rattachementMcCredit | Double | Module credits |
| rattachementMcId | Long | Module attachment ID |
| ueCode | String | Unit element code |
| ueNatureLlFr | String | Unit nature (French) |
| autorisationDemandeRecours | Boolean | Appeal request authorized |
| dateDebutDepotRecours | Date | Appeal submission start date |
| dateLimiteDepotRecours | Date | Appeal submission deadline |

**Note**: Only non-null values are returned.

---

### 12. Get Student Photo

> ** NOTE**: This endpoint returns the student's photo as a base64-encoded string.

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/image/{uuid}
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/image/868b3632-21e4-443a-93aa-675aed543889
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | String (Path) | Student's UUID |

#### Response
Returns a base64-encoded image string that can be directly embedded in an `<img>` tag:
```html
<img src="data:image/jpeg;base64,{response}" alt="Student Photo" />
```

#### Error Handling
- Returns **404** if the student has no photo on file
- Handle gracefully by showing a placeholder image

---

### 13. Verify Student Card Registration

> ** NOTE**: This endpoint is used to generate QR codes on student cards for verification purposes.

#### Endpoint
```
GET https://progres.mesrs.dz/api/infos/checkInscription/{cardId}
```

#### Example
```
GET https://progres.mesrs.dz/api/infos/checkInscription/6150897
```

#### Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| cardId | Long (Path) | Student card ID (from `id` in StudentCardDto) |

#### Response
Returns verification information about the student's registration status.

#### Usage
This URL is typically encoded as a QR code on the physical student card for quick verification by administrators.

---

## Student Card Data Mapping

The following table shows which fields from the `/api/infos/bac/{uuid}/dias` endpoint are used for displaying the student card:

| Card Element | Field Name | Type | Description |
|--------------|-----------|------|-------------|
| **Personal Information** |
| Student Name (Arabic) | `individuNomArabe`, `individuPrenomArabe` | String | Full name in Arabic |
| Student Name (Latin) | `individuNomLatin`, `individuPrenomLatin` | String | Full name in Latin characters |
| Date of Birth | `individuDateNaissance` | Date | Birth date |
| Place of Birth (Arabic) | `individuLieuNaissanceArabe` | String | Birth place in Arabic |
| Place of Birth (Latin) | `individuLieuNaissance` | String | Birth place in Latin |
| **University Information** |
| University (Arabic) | `llEtablissementArabe` | String | University name in Arabic |
| University (Latin) | `llEtablissementLatin` | String | University name in Latin |
| University Logo | `establishmentLogo` | byte[] | Logo image (if available) |
| **Academic Information** |
| Field/Domain (Arabic) | `ofLlDomaineArabe` | String | Field of study in Arabic |
| Specialty (Arabic) | `ofLlSpecialiteArabe` | String | Specialty in Arabic |
| Level (Arabic) | `niveauLibelleLongAr` | String | Academic level in Arabic |
| Academic Year | `anneeAcademiqueCode` | String | Academic year code |
| **Identification** |
| Registration Number | `numeroInscription` | String | Unique registration number |
| Card ID | `id` | Long | Card ID (used for QR code) |

### Student Card Design Elements

The student card design includes:

1. **Background Elements**:
   - Dotted pattern overlay (radial gradient)
   - Green wavy sine wave on right edge (dotted line)
   - Academic year displayed vertically on right side

2. **Header Section**:
   - University logo (circular with Arabic/French text)
   - Ministry title (Arabic)
   - "Student Card" title (بطاقة الطالب)

3. **Main Content**:
   - Student photo (from `/api/infos/image/{uuid}`)
   - Name in Arabic and Latin
   - Date of birth
   - Field, specialty, and level

4. **Footer Section**:
   - ONOU logo (left)
   - QR code (center) - links to `/api/infos/checkInscription/{cardId}`
   - ID badge icon (right)
   - Registration number

---

**Document Date**: March 2023 (Updated February 2026)  
**Source**: DRDN (Direction des réseaux et du développement du numérique)