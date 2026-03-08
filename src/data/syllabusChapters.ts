import { Chapter, Topic } from '@/types';

function makeTopic(id: string, name: string, subjectId: string): Topic {
  return {
    id, name, subjectId,
    status: 'not-started',
    completedStages: [],
    confidence: 0,
    targetQuestions: 20,
    questionsSolved: 0,
    pyqDone: false,
    nextRevisionDate: null,
    revisionSession: 0,
    lastStudied: null,
  };
}

function makeChapter(id: string, name: string, subjectId: string, topicNames: string[]): Chapter {
  return {
    id, name, subjectId,
    topics: topicNames.map((t, i) => makeTopic(`${id}-t-${i}`, t, subjectId)),
  };
}

export const defaultChapters: Chapter[] = [
  // ═══════════════════════════════════════
  // ANATOMY
  // ═══════════════════════════════════════
  makeChapter('anatomy-ch-1', 'General Embryology', 'anatomy', [
    'Developmental Timeline', 'Gametogenesis', 'Gametogenesis 2',
    'Developmental period: Week 1 & 2', 'Developmental period: Week 3 & 4',
    'Germ layer derivatives', 'Ectoderm and neural crest cells derivatives',
    'Mesoderm derivative', 'Endoderm derivatives', 'Placenta formation',
  ]),
  makeChapter('anatomy-ch-2', 'Histology', 'anatomy', [
    'Body tubes', 'Epithelial tissue', 'Glands', 'Connective tissue',
    'Cartilage tissue', 'Lymphoid tissue', 'Integumentary system',
    'Cell junctions', 'Muscular tissue', 'Respiratory system',
    'Digestive system', 'Urinary system', 'Genital system',
  ]),
  makeChapter('anatomy-ch-3', 'Osteology and Arthrology', 'anatomy', [
    'Osteology', 'Arthrology',
  ]),
  makeChapter('anatomy-ch-4', 'Neuro Anatomy', 'anatomy', [
    'Organization of nervous system', 'Development of nervous system',
    'Third ventricle', 'Fourth ventricle', 'White matter (Types of fibers)',
    'Neural columns', 'Cerebrum', 'Basal ganglia', 'Internal capsule',
    'Thalamus and hypothalamus', 'Brainstem and cranial nerve nuclei',
    'Neural columns and brain stem nuclei', 'Cerebellum', 'Spinal cord',
    'Autonomic nervous system', 'Arterial supply of brain',
    'Brainstem lesions', 'Venous drainage of cranial cavity',
  ]),
  makeChapter('anatomy-ch-5', 'Head and Neck', 'anatomy', [
    'Pharyngeal arches', 'Pharyngeal pouches & clefts', 'Tongue development',
    'Pharyngeal arch arteries', 'Development of skull', 'Cranial cavity',
    'Cranial fossae and related foramina', 'Posterior cranial fossa',
    'Trigeminal nerve', 'Cavernous sinus', 'Facial nerve',
    'Glossopharyngeal nerve', 'Vagus nerve', 'Hypoglossal nerve',
    'Cervical plexus', 'Scalenus anterior muscle: Relations',
    'Head and neck: Arterial supply', 'Head and neck: Venous drainage',
    'Head and neck: Lymphatic drainage', 'Scalp', 'Neck triangles',
    'Neck fascia and spaces', 'Parotid gland', 'Pharynx', 'Oesophagus',
    'Larynx', 'Vertebral landmarks', 'Ear', 'Eyeball', 'Cranial nerve: 3,4 and 6',
  ]),
  makeChapter('anatomy-ch-6', 'Back Region', 'anatomy', [
    'Spinal cord termination', 'Spinal cord: enlargements and spaces',
    'Vertebrae', 'Lumbar puncture', 'Vertebral curvatures and slip disc',
    'Cranio-vertebral joints', 'Vertebral landmarks and triangles',
  ]),
  makeChapter('anatomy-ch-7', 'Thorax', 'anatomy', [
    'Development: Cardiovascular system', 'Development: Embryonic veins',
    'Development: Heart tube', 'Development: Heart tube and transverse pericardial sinus',
    'Development: Interatrial septum', 'Development: AP septum formation and anomalies',
    'Development: Fetoplacental circulation', 'Heart: Surfaces and grooves',
    'Heart: Venous drainage', 'Heart: Interior', 'Heart: Arterial supply',
    'Sternal angle and mediastinum', 'Lungs: Hilum', 'Lungs: Bronchopulmonary segments',
    'Lungs: Pleura - surface markings', 'Joints', 'Respiratory movements',
    'Intercostal drainage and block', 'Phrenic nerve', 'Venous drainage', 'Lymphatic drainage',
  ]),
  makeChapter('anatomy-ch-8', 'Upper Limb', 'anatomy', [
    'Embryology', 'Nerve supply (overview)', 'Dermatomes and myotomes',
    'Brachial plexus - I (Trunks)', 'Brachial plexus - II (Cords)',
    'Bones and muscles (proximal region)', 'Axilla', 'Scapular movements',
    'Clavipectoral fascia', 'Muscles of anterior arm region',
    'Muscles of anterior forearm region', 'Cubital fossa',
    'Carpal and metacarpal bones', 'Muscles of hand', 'Posterior forearm muscles',
    'Anatomical snuffbox', 'Nerve supply: anterior forearm and hand muscle',
    'Median nerve lesions', 'Ulnar nerve lesions', 'Radial nerve lesions',
    'Nerve lesions: Comparative analysis', 'Arterial supply', 'Venous drainage',
    'Lymphatic drainage', 'Hand spaces',
  ]),
  makeChapter('anatomy-ch-9', 'Abdomen', 'anatomy', [
    'Umbilical cord contents and anomalies', 'Diaphragm: development and openings',
    'Development of mesentery and pancreas', 'Gut rotation', 'Abdominal planes',
    'Neurovascular bundles', 'Liver', 'Inguinal and femoral region and associated herniae',
    'Peritoneal cavity: sacs and spaces', 'Abdomen: Arterial supply', 'Stomach',
    'Small intestine: Duodenum', 'Small intestine: Biliary apparatus',
    'Small intestine: Jejunum and Ileum', 'Large intestine', 'Pancreas',
    'Kidney', 'Ureter', 'Venous drainage of abdomen and thorax',
  ]),
  makeChapter('anatomy-ch-10', 'Pelvis and Perineum', 'anatomy', [
    'Perineal pouches and ischiorectal fossa', 'Development of genito-urinary system',
    'Pelvis and perineum', 'Prostate gland and parts of male urethra',
    'Pelvic diaphragm', 'Perineal pouches - II', 'Extravasation of urine',
    'Pudendal nerve', 'Pelvis & perineum: nerve supply',
    'Pelvis & perineum: Arterial supply', 'Female reproductive system',
    'Rectum and anal canal',
  ]),
  makeChapter('anatomy-ch-11', 'Lower Limb', 'anatomy', [
    'Nerve supply - overview', 'Muscles of proximal region (hip and knee joints)',
    'Nerve supply thigh muscles', 'Movement and associated muscles: Hip and knee joints',
    'Muscles and gluteal region', 'Hybrid muscles', 'Popliteus', 'Knee joint',
    'Adductor canal', 'Popliteal fossa', 'Leg muscles',
    'Leg and foot region: nerve supply', 'Flexor retinaculum', 'Plantar arches',
    'Sole muscles', 'Arterial supply', 'Venous drainage',
  ]),

  // ═══════════════════════════════════════
  // PHYSIOLOGY
  // ═══════════════════════════════════════
  makeChapter('physiology-ch-1', 'General Physiology', 'physiology', [
    'General Physiology', 'Concepts in Physiology',
    'Cell membrane and transport proteins', 'Transport process',
  ]),
  makeChapter('physiology-ch-2', 'Nerve Muscle Physiology', 'physiology', [
    'Membrane potential', 'Excitation and action potential', 'Nerve',
    'Muscle - I', 'Muscle - II', 'Sarcomere', 'Smooth muscle',
  ]),
  makeChapter('physiology-ch-3', 'Blood Physiology', 'physiology', [
    'Blood physiology',
  ]),
  makeChapter('physiology-ch-4', 'Gastrointestinal System', 'physiology', [
    'Gastrointestinal tract',
  ]),
  makeChapter('physiology-ch-5', 'Cardiovascular System', 'physiology', [
    'Conducting system of the heart', 'ECG', 'Cardiac cycle - 1',
    'Cardiac cycle - 2', 'Cardiac output', 'Circulation Part - 1', 'Circulation Part - 2',
  ]),
  makeChapter('physiology-ch-6', 'Respiratory System', 'physiology', [
    'Introduction: Respiratory System', 'Part - 1', 'Part - 2', 'Part - 3', 'Part - 4',
  ]),
  makeChapter('physiology-ch-7', 'Excretory System', 'physiology', [
    'Renal physiology glomerular function', 'Excretory system: Acid base balance',
  ]),
  makeChapter('physiology-ch-8', 'Endocrine and Reproductive System', 'physiology', [
    'Introduction to Endocrines', 'Endocrine system', 'Part - 1', 'Part - 2',
    'Male reproductive system', 'Female reproductive system',
  ]),
  makeChapter('physiology-ch-9', 'The Nervous System', 'physiology', [
    'Introduction to central nervous system', 'Sensory system', 'Motor system',
    'Part - 1', 'Part - 2', 'Physiology of pain', 'Higher functions',
    'Autonomic nervous system',
  ]),
  makeChapter('physiology-ch-10', 'Special Senses', 'physiology', [
    'Special senses', 'Part - 1', 'Part - 2',
  ]),

  // ═══════════════════════════════════════
  // BIOCHEMISTRY
  // ═══════════════════════════════════════
  makeChapter('biochemistry-ch-1', 'Concepts', 'biochemistry', [
    'Four formulas', 'How to use formulas', 'cAMP and cGMP',
    'Sources of blood glucose', 'Fuel in fed, fasting and starvation',
    'Fasting state', 'Acetyl CoA', 'Diabetes', 'Respiratory quotient',
    'Cell organelles', 'Basics of carbohydrate and enzymes', 'High energy compounds',
  ]),
  makeChapter('biochemistry-ch-2', 'Carbohydrate Chemistry', 'biochemistry', [
    'Basics of carbohydrate chemistry', 'Isomerism', 'Classification of carbohydrate',
    'Mucopolysaccharidosis', 'Beta Galactosidase', 'Glucose transporters',
  ]),
  makeChapter('biochemistry-ch-3', 'Carbohydrate Metabolism', 'biochemistry', [
    'Glycolysis', 'Arsenic', 'Link reaction', 'TCA cycle',
    "Pasteur's and Warburg effects", 'NADH shuttles', 'ETC', 'Gluconeogenesis',
    'Reciprocal regulation', 'TIGAR', 'Glycogen metabolism',
    'Glycogen storage diseases', 'Glycogen regulation', 'HMP',
    'Uronic acid pathway', 'Galactose metabolism', 'Fructose metabolism', 'Sorbitol pathway',
  ]),
  makeChapter('biochemistry-ch-4', 'Enzymes', 'biochemistry', [
    'Enzyme basics', 'Cofactors', 'Isoenzymes', 'Enzyme classification',
    'Enzyme kinetics', 'Enzyme inhibitors', 'Enzyme uses', 'Enzyme regulation',
  ]),
  makeChapter('biochemistry-ch-5', 'Amino Acids and Proteins', 'biochemistry', [
    'Amino acids: basics', 'Classification and metabolism of amino acids',
    'Glycine metabolism', 'Phenylalanine and tyrosine metabolism',
    'Tryptophan metabolism', 'Methionine and cysteine metabolism',
    'Catabolism of amino acids', 'Transamination', 'Hyperammonemia',
    'Urea cycle', 'Urea cycle disorders', 'Nitric oxide',
    'Protein bonds and structure', 'Protein Precipitation',
    'Color reactions of amino acids and proteins', 'Chromatography and electrophoresis',
    'Fibrous proteins', 'Haem synthesis', 'Porphyria', 'Haem catabolism', 'Chaperones',
  ]),
  makeChapter('biochemistry-ch-6', 'Lipids', 'biochemistry', [
    'Lipid chemistry', 'Sphingolipidoses', 'PUFAs', 'Lipoproteins', 'HDL',
    'Lipotropic factors', 'Fatty acid synthesis', 'Ketone body pathways',
    'Beta oxidation of fatty acids', 'Cholesterol synthesis', 'Bile acids',
  ]),
  makeChapter('biochemistry-ch-7', 'Molecular Biology', 'biochemistry', [
    'Nucleotides', 'Basics of genetics', 'Genetic disorders', 'Mitochondrial DNA',
    'DNA replication', 'Klenow fragment', 'DNA repair', 'Types of RNAs', 'Introns',
    'Transcription', 'Post transcriptional modifications', 'Ribozyme', 'Operon model',
    'Codon', 'Translation', 'Genetic techniques', 'Epigenetics and genomic imprinting', 'CRISPR',
  ]),
  makeChapter('biochemistry-ch-8', 'Miscellaneous', 'biochemistry', [
    'Alcohol metabolism', 'Vitamins general', 'Vitamin A', 'Vitamin D', 'Vitamin E',
    'Vitamin K', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5', 'Vitamin B6',
    'Vitamin B7', 'Vitamin B9', 'Vitamin B12', 'Vitamin C', 'Minerals-basics',
    'Calcium', 'Iron', 'Copper', 'Menkes and Wilson disease', 'Selenium and fluorine',
    'Zinc and chromium', 'Free radicals', 'Xenobiotics', 'Muscle energy systems',
    'Meister cycle', 'Buffers and titration curve', 'Polyamine pathway', 'HbA1C', '1 carbon metabolism',
  ]),

  // ═══════════════════════════════════════
  // PATHOLOGY
  // ═══════════════════════════════════════
  makeChapter('pathology-ch-1', 'Cell Injury', 'pathology', [
    'Concepts of cell injury', 'Cellular adaptation', 'Irreversible injury 1',
    'Irreversible injury 2', 'Free radical injury', 'Ferroptosis', 'Pigmentation',
  ]),
  makeChapter('pathology-ch-2', 'Inflammation', 'pathology', [
    'Introduction to inflammation and vascular changes', 'Intravascular cellular changes',
    'Extravascular cellular changes', 'Oxygen dependent and independent bacteria killing',
    'Neutrophil extracellular trap', 'Preformed chemical mediators',
    'Freshly formed chemical mediators', 'Plasma chemical mediators',
    'Coagulation cascade', 'Chronic inflammation and wound healing',
  ]),
  makeChapter('pathology-ch-3', 'Immunity 1', 'pathology', [
    'Basics of immune system activation', 'Hypersensitivity reactions I to IV',
    'Major histocompatibility complex',
  ]),
  makeChapter('pathology-ch-4', 'Immunity 2', 'pathology', [
    'Concept of tolerance and basics of autoimmune disorder',
    'Autoimmune disorders 1: SLE', 'Autoimmune disorders 2',
    'Concepts of organ transplant', 'Immunodeficiency disorders', 'Amyloidosis',
  ]),
  makeChapter('pathology-ch-5', 'Genetics', 'pathology', [
    'Introduction: genetics', 'Single gene disorder',
    'Non-classical inheritance disorders', 'Specific cytogenetic disorders',
  ]),
  makeChapter('pathology-ch-6', 'Hematology: Red Blood Cells', 'pathology', [
    'Hematopoiesis: basic concepts', 'RBC development and classification of anemias',
    'Microcytic Anemias 1', 'Microcytic Anemias 2',
    'Hereditary spherocytosis and G6PD deficiency', 'Basic concepts of hemolytic anemias',
    'Hemoglobinopathies: sickle cell anemia and thalassemia', 'Megaloblastic Anemia',
    'Autoimmune hemolytic anemia', 'Miscellaneous disorders',
    'Paroxysmal nocturnal hemoglobinuria',
  ]),
  makeChapter('pathology-ch-7', 'Hematology: White Blood Cells', 'pathology', [
    'Introduction to WBC disorders', 'Acute leukemias: ALL and AML',
    'Chronic myeloid leukemia', 'Myeloid disorders', 'Lymphomas: HL and NHL',
    'Plasma cell dyscrasias', 'Plasma cell disorders',
    "Waldenstrom's disease and heavy chain disorders",
  ]),
  makeChapter('pathology-ch-8', 'Platelets and Blood Transfusion', 'pathology', [
    'Concepts of bleeding disorders', 'Introduction to platelet disorders',
    'Angiopathic hemolytic anemia: basic concepts',
    'Clotting factor disorders and concept of factor inhibitors',
    'Von Willebrand disease', 'Blood transfusion and blood grouping', 'Platelet disorders',
  ]),
  makeChapter('pathology-ch-9', 'Gastrointestinal Tract', 'pathology', [
    'Carcinoid tumor', 'Introduction to GIT', 'Inflammatory bowel disease',
    'Stomach basics gastritis and gastropathy', 'Peptic ulcer disease',
    'Acute and chronic gastritis', 'Small intestine malabsorption disorders',
    'Intestinal polyps and colon cancer', 'Gastric tumors',
    'Alcohol induced esophageal disorders and achalasia cardia',
    "Esophagus applied aspects, esophagitis and Barrett's esophagus",
    'Esophageal tumors', 'Congenital GIT Anomalies', 'GIT disorders 1',
    'GIT disorders 2', 'GIT disorders 3',
  ]),
  makeChapter('pathology-ch-10', 'Respiratory System', 'pathology', [
    'Obstructive lung disorder', 'Restrictive lung disorder', 'Pulmonary hypertension',
    'Infective lung disorders', 'Pulmonary tuberculosis', 'Pneumoconiosis',
    'Miscellaneous topics: ARDS', 'Neonatal respiratory distress syndrome',
    'Lung tumors', 'Lung abscess',
  ]),
  makeChapter('pathology-ch-11', 'Breast', 'pathology', ['Breast disorders']),
  makeChapter('pathology-ch-12', 'Bone Disorders', 'pathology', ['Bone tumors']),
  makeChapter('pathology-ch-13', 'Neoplasia', 'pathology', [
    'Basic concepts of neoplasia', 'Genetic basis of carcinogenesis - 1',
    'Genetic basis of carcinogenesis - 2', 'Cancer genes',
    'Etiological factors of neoplasia', 'Diagnosis of cancers', 'Liquid Biopsy',
    'Paraneoplastic syndromes',
  ]),
  makeChapter('pathology-ch-14', 'CVS, Blood Vessels and Vasculitis', 'pathology', [
    'Vasculitis', 'Ischemic heart disease', 'Rheumatic fever and infective endocarditis',
    'Cardiac tumors',
  ]),
  makeChapter('pathology-ch-15', 'Kidney and Urinary Bladder', 'pathology', [
    'Congenital renal disorders', 'Glomerular disorders 1: nephritic disorders',
    'Hereditary nephritis', 'Glomerular disorders 2: nephrotic disorders',
    'Renal stones', 'Renal tumors',
  ]),
  makeChapter('pathology-ch-16', 'Liver, Biliary System and Pancreas', 'pathology', [
    'Liver disorders 1', 'Liver disorders 2',
  ]),
  makeChapter('pathology-ch-17', 'Genital System', 'pathology', [
    'Male genital tract disorder 1', 'Male genital tract disorder 2',
    'Female genital tract disorder 1', 'Female genital tract disorder 2',
    'Female genital tract disorder 3',
  ]),
  makeChapter('pathology-ch-18', 'Endocrinology', 'pathology', [
    'Parathyroid and thyroid disorders', 'Adrenal gland disorders',
  ]),
  makeChapter('pathology-ch-19', 'Central Nervous System', 'pathology', [
    'CNS disorders 1', 'CNS disorders 2', 'Meningitis',
  ]),

  // ═══════════════════════════════════════
  // PHARMACOLOGY
  // ═══════════════════════════════════════
  makeChapter('pharmacology-ch-1', 'Covid-19', 'pharmacology', [
    'Drug update for Covid-19', 'Covid-19',
  ]),
  makeChapter('pharmacology-ch-2', 'General Pharmacology', 'pharmacology', [
    'Pharmacokinetics (Absorption)', 'Pharmacokinetics (Distribution)',
    'Pharmacokinetics (Metabolism)', 'Pharmacokinetics (Excretion and calculations)',
    'Pharmacodynamics', 'Pharmacogenetics', 'Therapeutic drug monitoring',
    'Clinical trials', 'Plasma conc VS Time graph', 'Steady state',
    'Numericals in pharmacology', 'ADR and pharmacovigilance',
    'Drugs in pregnancy and lactation', 'Drugs antagonism', 'Combined effect of drugs',
    'Practicals in general pharmacology', 'Details of enzymatic receptors',
    'Spare receptors', 'Receptor regulation', 'Drugs with peculiar names',
    'Types of enzyme inhibitors', 'Prescription', 'Hereditary angioneurotic edema',
    'Different named receptors',
  ]),
  makeChapter('pharmacology-ch-3', 'Autonomic Nervous System', 'pharmacology', [
    'Cholinergic drugs', 'Anti-cholinergic drugs', 'Adrenergic drugs',
    'Anti adrenergic drugs', 'Tertiary and quaternary amines', 'VMAT 2 inhibitors',
    'Active and passive mydriasis', 'Rabbit experiments (Eye and Ileum)',
    'Bladder pharmacology', 'Glaucoma',
  ]),
  makeChapter('pharmacology-ch-4', 'Cardiovascular System', 'pharmacology', [
    'Congestive heart failure', 'Ischemic heart disease (Angina and MI)',
    'Hypertension', 'Arrhythmias', 'Dyslipidemia', 'Pulmonary hypertension',
    'Management of shock',
  ]),
  makeChapter('pharmacology-ch-5', 'Kidney', 'pharmacology', ['Diuretics']),
  makeChapter('pharmacology-ch-6', 'Respiratory System', 'pharmacology', [
    'Drugs for cough and bronchial asthma',
  ]),
  makeChapter('pharmacology-ch-7', 'Gastro-Intestinal Tract', 'pharmacology', [
    'Drugs for peptic ulcer', 'Laxative purgatives',
    'Vomiting, Diarrhea and inflammatory bowel syndrome',
  ]),
  makeChapter('pharmacology-ch-8', 'Endocrine System', 'pharmacology', [
    'Pituitary hypothalamic system', 'Thyroid', 'Pancreas', 'Adrenal',
    'Osteoporosis', 'Sex hormones', 'Oral contraceptives',
    'Bromocriptine in diabetes mellitus',
  ]),
  makeChapter('pharmacology-ch-9', 'Central Nervous System', 'pharmacology', [
    'Sedative hypnotics', 'Parkinsonism', 'Epilepsy', 'Psychiatric illness',
    'Drugs of abuse (Opioids and alcohols)',
  ]),
  makeChapter('pharmacology-ch-10', 'Hematology', 'pharmacology', [
    'Drugs affecting blood flow', 'Drugs affecting cells of blood',
  ]),
  makeChapter('pharmacology-ch-11', 'Antimicrobial Drugs', 'pharmacology', [
    'Cell wall synthesis inhibitors', 'Protein synthesis inhibitors',
    'Antimetabolites and quinolones', 'Drugs not effective against certain bacteria',
    'Pseudomembranous colitis', 'TDK CDK and PAE', 'Antimicrobial resistance',
    'Mycobacterial diseases (TB, Leprosy and MAC)', 'Antiviral drugs',
    'Antifungal drugs', 'Topical antifungal drugs', 'Anti parasitic drugs',
    'Antimicrobial agents',
  ]),
  makeChapter('pharmacology-ch-12', 'Anticancer and Immunosuppressants', 'pharmacology', [
    'Monoclonal antibodies', 'Cytotoxic anticancer drugs',
    'Targeted anticancer drugs and immunosuppressants',
  ]),
  makeChapter('pharmacology-ch-13', 'Autacoids', 'pharmacology', [
    'Histamine and 5-HT', 'Migraine', 'PGs, LTs and NSAIDs',
    'Gout and Rheumatoid Arthritis',
  ]),
  makeChapter('pharmacology-ch-14', 'Anesthesia', 'pharmacology', [
    'Local anesthesia', 'Skeletal muscle relaxants', 'General anesthesia',
  ]),
  makeChapter('pharmacology-ch-15', 'Miscellaneous', 'pharmacology', [
    'Chelating agents', 'Hyperkalemia',
  ]),

  // ═══════════════════════════════════════
  // MICROBIOLOGY
  // ═══════════════════════════════════════
  makeChapter('microbiology-ch-1', 'Covid-19', 'microbiology', ['Covid-19']),
  makeChapter('microbiology-ch-2', 'Introduction', 'microbiology', ['Introduction to microbiology']),
  makeChapter('microbiology-ch-3', 'Systematic Bacteriology', 'microbiology', [
    'Gram positive cocci, Gram negative cocci',
    'Gram Positive Bacilli (part-1)', 'Gram Positive Bacilli (part-2)',
    'Enterobacteriaceae, E.coli, Klebsiella, Proteus, Salmonella, Shigella, Pseudomonas, Vibrio',
    'Haemophilus, HACEK, Bordetella, Brucella, Yersinia, Legionella, Spirochetes',
    'Leptospira, Rickettsiae, Scrub typhus, Q fever, Ehrlichia, Bartonella, Chlamydiae, Campylobacter, Helicobacter, Mycoplasma, Bacteroids',
  ]),
  makeChapter('microbiology-ch-4', 'Mycology', 'microbiology', ['Mycology']),
  makeChapter('microbiology-ch-5', 'Parasitology', 'microbiology', [
    'Protozoology', 'Helminthology',
  ]),
  makeChapter('microbiology-ch-6', 'Virology', 'microbiology', [
    'DNA viruses', 'RNA viruses', 'Virology and bacteriology must know updates',
  ]),
  makeChapter('microbiology-ch-7', 'Immunology', 'microbiology', [
    'Immunology part - 1', 'Immunology part - 2', 'Immunology part - 3',
  ]),
  makeChapter('microbiology-ch-8', 'General Microbiology', 'microbiology', [
    'General Microbiology part - 1', 'General Microbiology part - 2',
    'General Microbiology part - 3',
  ]),
  makeChapter('microbiology-ch-9', 'System Wise Clinical Microbiology', 'microbiology', [
    'Normal microbial flora', 'Bone and joint infection', 'GIT infections',
    'Urinary tract infection', 'Pelvic infections', 'Cardiac infections',
    'Upper respiratory tract infections', 'Lower respiratory tract infections',
    'Central nervous system infections', 'Bloodstream infections',
    'Fever of unknown origin', 'Anemia causing organisms', 'Eye and ear infections',
    'Skin lesions', 'Nosocomial infections', 'Hand hygiene',
    'Organisms transmitted by droplet and aerosol', 'Biosafety levels',
    'Occupational exposures (HIV and HBV)', 'BMW management',
  ]),

  // ═══════════════════════════════════════
  // FORENSIC MEDICINE
  // ═══════════════════════════════════════
  makeChapter('forensic-ch-1', 'Forensic Traumatology', 'forensic', [
    'Mechanical Injuries', 'Regional Injuries-1', 'Regional Injuries-2',
    'Forensic Ballistics', 'Blast Injuries', 'Thermal Injuries-1',
    'Thermal Injuries-2', 'Explosion Injuries and SCALD', 'Electrical Injuries',
    'Cold Injury', 'Heat Artefacts', 'Transportation Injuries', 'Torture Method',
  ]),
  makeChapter('forensic-ch-2', 'Indian Legal System & Medical Jurisprudence', 'forensic', [
    'Indian Legal System- Court Procedures', 'Legal Sections',
    'Medical Jurisprudence- Part 1', 'Medical Jurisprudence- Part 2',
    'Medical Certification of cause of Death',
  ]),
  makeChapter('forensic-ch-3', 'Violent Asphyxia Deaths', 'forensic', [
    'Hanging and Strangulation', 'Suffocation', 'Drowning',
  ]),
  makeChapter('forensic-ch-4', 'Forensic Thanatology & Identity', 'forensic', [
    'Postmortem Techniques', 'Thanatology', 'Human Identification-1',
    'Human Identification-2', 'Human Identification-3',
  ]),
  makeChapter('forensic-ch-5', 'Sexual Jurisprudence', 'forensic', [
    'Sexual offences', 'Impotency, Virginity, Pregnancy and Abortion',
    'Infant Death', 'Trace Evidences', 'Battered Baby Syndrome',
  ]),
  makeChapter('forensic-ch-6', 'Forensic Toxicology', 'forensic', [
    'Toxicology Introduction', 'Diagnosis of poisoning in case of Living',
    'Diagnosis of poisoning in case of Dead',
    'General guidelines in the management of a case of poisoning',
    'Corrosives', 'Metallic Poisons', 'Non-metallic Irritants', 'Animal Irritants',
    'Plant Irritants', 'Cerebral Poisons', 'Delirients', 'Cardiac Poisons',
    'Spinal Poisons', 'Asphyxiants', 'Agricultural Poisons',
  ]),
  makeChapter('forensic-ch-7', 'Starvation Deaths', 'forensic', ['Starvation Deaths']),
  makeChapter('forensic-ch-8', 'Forensic Psychiatry', 'forensic', ['Forensic Psychiatry']),

  // ═══════════════════════════════════════
  // MEDICINE
  // ═══════════════════════════════════════
  makeChapter('medicine-ch-1', 'Cardiology', 'medicine', [
    'Mitral valve prolapse', 'Percutaneous coronary intervention',
    'Heart sounds 1', 'Heart sounds 2', 'Heart sounds 3',
    'Mitral regurgitation', 'Aortic stenosis', 'Aortic regurgitation',
    'Tricuspid stenosis', 'Tricuspid regurgitation and pulmonic stenosis and regurgitation',
    'Murmurs', 'Cardiomyopathies', 'Takotsubo cardiomyopathies and Brugada syndrome',
    'Rheumatic heart disease', 'Infective endocarditis',
    'ECG and arrhythmias part 1', 'ECG and arrhythmias part 2',
    'Multifocal atrial tachycardia', 'ECG changes in hypokalemia & hyperkalemia',
    'Acute coronary syndrome part 1', 'Acute coronary syndrome part 2',
    'Symptomatic bradycardia with pulse', 'Congenital heart disease',
    'Metabolic-syndrome-X and syndrome-Z', 'Hypertension', 'Disease of pericardium',
    'Congestive heart failure', 'Bundle branch block',
  ]),
  makeChapter('medicine-ch-2', 'Emergency Medicine', 'medicine', [
    'Basic cardiac life support', 'Pulseless electrical activity',
    'Advanced cardiac life support', 'Mechanical ventilation',
    'Massive transfusion protocol', 'ARDS', 'Snake bite',
    'AHA 2020 update on CPR guidelines', 'High altitude pulmonary edema',
  ]),
  makeChapter('medicine-ch-3', 'Endocrinology', 'medicine', [
    'Pancreatic neuroendocrine tumors', 'Diabetes mellitus - 1',
    'Diabetes mellitus - 2', 'Diabetic ketoacidosis and hyperosmolar coma',
    'Disorders of parathyroid gland', 'Disorders of adrenal gland',
    'Cushing syndrome', 'Diseases of thyroid', 'Diseases of anterior pituitary',
    'Multiple endocrine neoplasia',
  ]),
  makeChapter('medicine-ch-4', 'Nephrology / Kidney Disease', 'medicine', [
    'Electrolyte imbalances', 'Bartter syndrome, Gitelman syndrome, Liddle syndrome',
    'Ciliopathies/Chronic tubulointerstitial disorders', 'Polycystic kidney disease',
    'Thrombotic Thrombocytopenic purpura', 'Kidney urine analysis',
    'Acute kidney injury', 'Chronic kidney disease', 'Diabetic nephropathy',
    'Kidney stones', 'Renal tubular acidosis', 'Nephrotic and nephritic syndrome',
    'Renal artery stenosis',
  ]),
  makeChapter('medicine-ch-5', 'GIT', 'medicine', [
    'Bleeding from the gut', 'Peptic ulcer disease', 'Zollinger Ellison Syndrome',
    'Malabsorption Syndrome', 'Inflammatory Bowel Syndrome', 'Irritable Bowel Syndrome',
  ]),
  makeChapter('medicine-ch-6', 'Hematology', 'medicine', [
    'Chronic Lymphocytic Leukemia', 'Chronic Myeloid Leukemia',
    'Acute Myeloblastic Leukemia', 'Acute Lymphoblastic Leukemia',
    'Multiple Myeloma', 'Blood components', 'Blood transfusion complications',
    "Hodgkins and non-Hodgkin's lymphoma", 'Thalassemia',
    'Sickle cell disease, G-6PD deficiency and other hemolytic anemias',
    'Sideroblastic anemia', 'Platelet disorders',
  ]),
  makeChapter('medicine-ch-7', 'Neurology', 'medicine', [
    'Basics of middle cerebral artery and cranial nerve arrangement',
    'Mechanical thrombectomy', 'Stroke',
    'Transient ischemic attack and stroke interventions',
    'Intraparenchymal hemorrhage and other CNS bleeds', 'Subarachnoid hemorrhage',
    'Headache and migraine', 'Epilepsy and EEG', 'Raised ICP and brain death',
    'Intracranial space occupying lesion', 'Meningitis part 1', 'Meningitis part 2',
    'CNS infections in AIDS positive patients', "Parkinsonism and Parkinson's disease",
    'Myasthenia Gravis', 'Guillain Barre syndrome', 'Alzheimer disease',
    'Multiple sclerosis', 'Neuromyelitis optica', 'Amyotrophic lateral sclerosis',
    'Syringomyelia and conus medullaris syndrome', 'Channelopathies',
  ]),
  makeChapter('medicine-ch-8', 'Rheumatology / Connective Tissue Disorder', 'medicine', [
    'Systemic Lupus Erythematosus', 'Rheumatoid arthritis', 'Crystal arthropathy',
    'Vasculitis', 'Scleroderma', 'Sarcoidosis', 'Ankylosing spondylitis',
    'IGG4 related disease',
  ]),
  makeChapter('medicine-ch-9', 'Liver', 'medicine', [
    'Hepatitis B', 'Hepatitis-C, D and fulminant hepatitis',
    'Hepatorenal syndrome and hepatopulmonary syndrome', 'Autoimmune hepatitis',
    'Cirrhosis and its complications', 'PBC and PSC',
    'Wilson disease and hemochromatosis', 'Alcoholic hepatitis',
    'Hereditary Hyperbilirubinemia', 'Paracetamol/Acetaminophen toxicity',
    'Budd Chiari syndrome',
  ]),
  makeChapter('medicine-ch-10', 'Pulmonology', 'medicine', [
    'Cystic fibrosis', 'Obstructive sleep apnea', 'Pulmonary embolism',
    'Fat embolism syndrome', 'Bronchiectasis', 'Pneumonia', 'Bronchial asthma',
    'COPD', 'COPD update', 'Respiratory failure', 'Tuberculosis',
    'Interstitial lung disease', 'Pulmonary Alveolar proteinosis',
    'Pleural effusion', 'Pneumothorax', 'Flow volume curve, spirometry and DLCO',
    'ABG analysis simplified part 1', 'ABG analysis simplified part 2',
  ]),
  makeChapter('medicine-ch-11', 'Infections', 'medicine', [
    'Fever of unknown origin', 'Dengue fever', 'Nipah virus and Zika virus',
    'Pneumocystis Jirovecii', 'Aspergillosis', 'AIDS', 'Covid-19',
  ]),

  // ═══════════════════════════════════════
  // SURGERY
  // ═══════════════════════════════════════
  makeChapter('surgery-ch-1', 'Endocrine Surgery', 'surgery', [
    'Breast part 1', 'Breast part 2', 'Thyroid 1', 'Thyroid 2',
    'Parathyroid and adrenal gland',
  ]),
  makeChapter('surgery-ch-2', 'Hepatobiliary Pancreatic Surgery', 'surgery', [
    'Liver Part - 1', 'Liver Part - 2', 'Portal hypertension', 'Gallbladder',
    'Bile Duct part - 1', 'Bile Duct part - 2', 'Pancreas',
  ]),
  makeChapter('surgery-ch-3', 'Gastrointestinal Surgery', 'surgery', [
    'Esophagus', 'Stomach and Duodenum', 'Peritoneum', 'Intestinal obstruction',
    'Small intestine', 'Large intestine', 'Ileostomy and Colostomy',
    'Inflammatory bowel disease part 1', 'Inflammatory bowel disease Part 2',
    'Vermiform appendix', 'Rectum and anal canal',
  ]),
  makeChapter('surgery-ch-4', 'Hernia and Abdominal Wall', 'surgery', [
    'Part 1', 'Part 2', 'Spleen',
  ]),
  makeChapter('surgery-ch-5', 'Urology', 'surgery', [
    'Kidney and Ureter Part - 1', 'Kidney and Ureter Part - 2',
    'Kidney and Ureter Part - 3', 'Urinary bladder',
    'Prostate and seminal vesicles', 'Urethra and penis',
    'Testis and scrotum Part - 1', 'Testis and scrotum Part - 2',
  ]),
  makeChapter('surgery-ch-6', 'Cardiothoracic Vascular Surgery', 'surgery', [
    'Arterial disorders Part 1', 'Arterial disorders Part 2', 'Venous disorders',
    'Lymphatic system', 'Thorax and mediastinum Part 1', 'Thorax and mediastinum Part 2',
  ]),
  makeChapter('surgery-ch-7', 'Plastic Surgery', 'surgery', [
    'Burns', 'Plastic surgery and skin lesions', 'Wound healing tissue repair and scar',
  ]),
  makeChapter('surgery-ch-8', 'Neurosurgery', 'surgery', [
    'Cerebrovascular diseases', 'CNS tumor',
  ]),
  makeChapter('surgery-ch-9', 'Head and Neck', 'surgery', [
    'Oral cavity', 'Salivary glands', 'Neck', 'Facial injuries and abnormalities',
  ]),
  makeChapter('surgery-ch-10', 'Oncology', 'surgery', ['Oncology']),
  makeChapter('surgery-ch-11', 'Others', 'surgery', [
    'Trauma ATLS protocol', 'Nutrition', 'Pediatric surgery Part - I',
    'Pediatric surgery Part - II', 'Head injury', 'Neck and thoracic injuries',
    'Abdominal trauma', 'Transplantation Part 1', 'Transplantation Part 2',
    'Robotics, laparoscopy and bariatric surgery', 'Sutures and anastomoses',
    'Shock', 'General surgery', 'Tubes, catheters and drains',
    'Instruments Part 1', 'Instruments Part 2',
  ]),

  // ═══════════════════════════════════════
  // OBG (Gynaecology & Obstetrics)
  // ═══════════════════════════════════════
  makeChapter('obg-ch-1', 'Gynecology', 'obg', [
    'Mensuration', 'Menstrual problems in young and small girls',
    'Ovarian hyperstimulation syndrome', 'Tests of ovulation',
    'Endometriosis adenomyosis', 'Hormonal replacement therapy',
    'Ovarian tumors', 'Polycystic ovarian syndrome', 'Cervical carcinoma',
    'Post menopausal bleeding', 'Vulvar carcinoma', 'Fibroids', 'Hysterectomy',
    'Mullerian abnormalities', 'Abnormal uterine bleeding', 'Gametogenesis',
    'Intersex', 'Pubertal changes', 'Infertility', 'Genital organ prolapse',
    'Urinary fistula in obstetrics', 'Emergency contraceptives', 'Contraception',
    'Genital tract infection', 'Amenorrhea',
    'Clinical anatomy of female reproductive tract', 'Endometrial carcinoma',
  ]),
  makeChapter('obg-ch-2', 'Obstetrics', 'obg', [
    'Covid-19 in pregnancy', 'Postpartum hemorrhage',
    'Placenta: Separation and complications', 'Placenta and cord: complications',
    'Rh incompatibility', 'Twin pregnancy',
    'Molar pregnancy and gestational trophoblastic disease',
    'Antepartum Hemorrhage', 'Pregnancy induced hypertension',
    'Diabetes in pregnancy', 'Intrauterine growth restriction',
    'Medical illness complicating pregnancy', 'Parturition introduction',
    'Basic definitions, cardinal movements, ECV',
    'Fetal skull, maternal pelvis, important dimensions',
    'Malpositions, malpresentations',
    'Basics of instrumental delivery, methods of labor induction',
    'Episiotomy', 'Puerperium', 'Cesarean section', 'Infection in pregnancy',
    'Drugs in pregnancy', 'Anemia in pregnancy', 'Vomiting in pregnancy',
    'Ectopic pregnancy', 'Abortions', 'Induced abortions (MTP)',
  ]),
  makeChapter('obg-ch-3', 'Drugs & Instruments', 'obg', [
    'Drugs used in obstetrics and gynecology',
    'Instruments in gynecology and obstetrics',
  ]),

  // ═══════════════════════════════════════
  // PEDIATRICS
  // ═══════════════════════════════════════
  makeChapter('pediatrics-ch-1', 'Growth', 'pediatrics', [
    'Assessment of growth and growth charts', 'Normal Anthropometric parameters',
    'Short stature and tall stature', 'Abnormalities of head size and shape',
    'Normal and abnormal dentition',
  ]),
  makeChapter('pediatrics-ch-2', 'Normal Development', 'pediatrics', [
    'Important motor milestones', 'Social and language milestones',
    'Developmental implications of important milestones',
  ]),
  makeChapter('pediatrics-ch-3', 'Developmental and Behavioral Disorders', 'pediatrics', [
    'Abnormalities of development', 'Behavioral disorders in children',
  ]),
  makeChapter('pediatrics-ch-4', 'Puberty and Adolescence', 'pediatrics', [
    'Puberty and adolescence',
  ]),
  makeChapter('pediatrics-ch-5', 'Neonatology', 'pediatrics', [
    'Important techniques and preterm and post term neonates',
    'Primitive neonatal reflexes and conditions seen in neonates',
    'Neonatal resuscitation', 'IUGR and feeding of preterm neonate',
    'Neonatal sepsis', 'Neonatal hypothermia', 'Neonatal hypoglycemia',
    'Perinatal asphyxia', 'Important scores in neonates',
    'Necrotising enterocolitis', 'Neonatal jaundice', 'Erythroblastosis fetalis',
    'Latest updates in neonatology',
  ]),
  makeChapter('pediatrics-ch-6', 'Nutrition and Malnutrition', 'pediatrics', [
    'Breast milk and breastfeeding', 'Micronutrients in health and disease', 'Malnutrition',
  ]),
  makeChapter('pediatrics-ch-7', 'Fluid and Electrolyte Disturbances', 'pediatrics', [
    'Body composition and acid base balance', 'Disorders of sodium and potassium',
    'IV fluids in health and disease',
  ]),
  makeChapter('pediatrics-ch-8', 'Genetics and Genetic Disorders', 'pediatrics', [
    'Types of genetic disorders', 'Important genetic syndromes',
  ]),
  makeChapter('pediatrics-ch-9', 'Inborn Error of Metabolism', 'pediatrics', [
    'Disorders of carbohydrate metabolism', 'Disorders of amino acid metabolism',
    'Lysosomal storage disease',
  ]),
  makeChapter('pediatrics-ch-10', 'Diseases of Immune System', 'pediatrics', [
    'Primary immunodeficiency', 'Vasculitic disorders in children',
  ]),
  makeChapter('pediatrics-ch-11', 'Infectious Diseases', 'pediatrics', [
    'Important viral diseases in children', 'Covid-19 in children',
    'Important bacterial diseases in children', 'Congenital infection',
  ]),
  makeChapter('pediatrics-ch-12', 'Immunization', 'pediatrics', [
    'Immunization - general concepts and special situations', 'Individual vaccines',
  ]),
  makeChapter('pediatrics-ch-13', 'Pediatric Cardiology', 'pediatrics', [
    'Fetal circulation and classification of congenital heart disease',
    'Important acyanotic congenital heart diseases', 'Tetralogy of Fallot',
    'Rheumatic heart disease', 'Other congenital heart diseases',
  ]),
  makeChapter('pediatrics-ch-14', 'Pediatric Hematology and Oncology', 'pediatrics', [
    'Important hematological disorders in children',
    'Important bleeding & coagulation disorders in children',
    'Hematological malignancies in children', 'Tumors of infancy and childhood',
  ]),
  makeChapter('pediatrics-ch-15', 'Pediatric Gastroenterology', 'pediatrics', [
    'Disorders of gastrointestinal system including diarrhea',
    'Liver disorders in children',
  ]),
  makeChapter('pediatrics-ch-16', 'Pediatric Respiratory/Renal Disorders', 'pediatrics', [
    'Normal structure and function of kidney in children',
    'Acute and chronic kidney diseases',
    'Congenital abnormalities of genitourinary tract',
    'Nephritic and nephrotic syndrome',
    'Obstructive and infective disorders of urinary tract',
    'Renal tubular disorders',
  ]),
  makeChapter('pediatrics-ch-17', 'Pediatric Neurology', 'pediatrics', [
    'Congenital CNS malformations and hydrocephalus', 'Seizures in children',
    'Disorders with CNS involvement and brain death',
  ]),
  makeChapter('pediatrics-ch-18', 'Musculoskeletal Disorders in Children', 'pediatrics', [
    'Disorders of muscles in children', 'Rickets', 'Important disorders involving bones',
  ]),
  makeChapter('pediatrics-ch-19', 'Pediatric Endocrinology', 'pediatrics', [
    'Disorders of pituitary', 'Disorders of thyroid in children',
    'Adrenal disorders', 'Disorders of puberty',
    'Disorders of sexual development',
    'Type-1 Diabetes mellitus and obesity in children',
  ]),
  makeChapter('pediatrics-ch-20', 'Common Childhood Poisonings', 'pediatrics', [
    'Common childhood poisonings',
  ]),

  // ═══════════════════════════════════════
  // PSYCHIATRY
  // ═══════════════════════════════════════
  makeChapter('psychiatry-ch-1', 'Organic Mental Disorders', 'psychiatry', ['Organic Mental Disorders']),
  makeChapter('psychiatry-ch-2', 'Personality Disorders', 'psychiatry', ['Personality Disorders']),
  makeChapter('psychiatry-ch-3', 'Eating Disorders', 'psychiatry', ['Eating Disorders']),
  makeChapter('psychiatry-ch-4', 'Sleep Disorders', 'psychiatry', ['Sleep Disorders']),
  makeChapter('psychiatry-ch-5', 'Sexual Disorders', 'psychiatry', ['Sexual Disorders']),
  makeChapter('psychiatry-ch-6', 'Basics of Psychiatry', 'psychiatry', ['Basics of Psychiatry']),
  makeChapter('psychiatry-ch-7', 'Schizophrenia & Psychotic Disorders', 'psychiatry', ['Schizophrenia Spectrum and Other Psychotic Disorders']),
  makeChapter('psychiatry-ch-8', 'Mood Disorders', 'psychiatry', ['Mood Disorders']),
  makeChapter('psychiatry-ch-9', 'Neurotic & Somatoform Disorders', 'psychiatry', ['Neurotic Stress-Related and Somatoform Disorders']),
  makeChapter('psychiatry-ch-10', 'Substance Related Disorders', 'psychiatry', ['Substance Related and Addictive Disorders']),
  makeChapter('psychiatry-ch-11', 'Child Psychiatry', 'psychiatry', ['Child Psychiatry']),
  makeChapter('psychiatry-ch-12', 'Psychoanalysis', 'psychiatry', ['Psychoanalysis']),
  makeChapter('psychiatry-ch-13', 'Mental Health Care Act 2017', 'psychiatry', ['Mental Health Care Act 2017']),

  // ═══════════════════════════════════════
  // DERMATOLOGY
  // ═══════════════════════════════════════
  makeChapter('dermatology-ch-1', 'Introduction to Dermatology', 'dermatology', [
    'Basics of Dermatology, Cells of Epidermis', 'Level of Epidermis',
    'Histopathological Findings', 'Basement Membrane Zone',
    'Dermis and Subcutaneous Layer', 'Structure of Hair, Hair Disorders',
    'Disorders of Nails', 'Structure of Sweat Glands and Related Disorders',
    'Sebaceous Gland', 'Acne Vulgaris', 'Chemical Peeling', 'Skin Lesions',
  ]),
  makeChapter('dermatology-ch-2', 'Blistering Disorders', 'dermatology', ['Blistering Disorders']),
  makeChapter('dermatology-ch-3', 'Pigmentary Disorders', 'dermatology', ['Pigmentary Disorders']),
  makeChapter('dermatology-ch-4', 'Bacterial Infections', 'dermatology', ['Bacterial Infections']),
  makeChapter('dermatology-ch-5', 'Fungal Infections', 'dermatology', ['Fungal Infections']),
  makeChapter('dermatology-ch-6', 'Mycobacterial Infections', 'dermatology', ['Mycobacterial Infections']),
  makeChapter('dermatology-ch-7', 'Viral Infections', 'dermatology', ['Viral Infections']),
  makeChapter('dermatology-ch-8', 'Sexually Transmitted Infections', 'dermatology', ['Sexually Transmitted Infections']),
  makeChapter('dermatology-ch-9', 'Papulosquamous Disorders', 'dermatology', ['Papulosquamous Disorders']),
  makeChapter('dermatology-ch-10', 'Miscellaneous Disorders', 'dermatology', ['Miscellaneous Disorders', 'Skin Tumors']),

  // ═══════════════════════════════════════
  // RADIOLOGY
  // ═══════════════════════════════════════
  makeChapter('radiology-ch-1', 'X-rays', 'radiology', ['X-ray: Basic concepts']),
  makeChapter('radiology-ch-2', 'CT Scan', 'radiology', ['CT: Basic concepts']),
  makeChapter('radiology-ch-3', 'MRI', 'radiology', ['MRI: Basic concepts']),
  makeChapter('radiology-ch-4', 'Ultrasound', 'radiology', ['Ultrasound: Basic concepts']),
  makeChapter('radiology-ch-5', 'Thumb Rules', 'radiology', ['Radiological investigations and thumb rules']),
  makeChapter('radiology-ch-6', 'Interventional Radiology', 'radiology', ['Interventional Radiology']),
  makeChapter('radiology-ch-7', 'Contrast Agents', 'radiology', ['Contrast media']),
  makeChapter('radiology-ch-8', 'GI Radiology', 'radiology', ['GI Radiology']),
  makeChapter('radiology-ch-9', 'Hepatobiliary Radiology', 'radiology', ['Hepatobiliary radiology']),
  makeChapter('radiology-ch-10', 'Pancreatic Radiology', 'radiology', ['Pancreatic radiology']),
  makeChapter('radiology-ch-11', 'Genitourinary Radiology', 'radiology', ['Genitourinary radiology']),
  makeChapter('radiology-ch-12', 'Neuroradiology', 'radiology', ['Neuroradiology Part 1', 'Neuroradiology Part 2']),
  makeChapter('radiology-ch-13', 'Musculoskeletal Radiology', 'radiology', ['Arthritis', 'Bone tumors', 'Musculoskeletal radiology']),
  makeChapter('radiology-ch-14', 'Women Imaging', 'radiology', ["Women's Imaging"]),
  makeChapter('radiology-ch-15', 'Cardiovascular Radiology', 'radiology', ['CVS Radiology', 'Approach to CHD']),
  makeChapter('radiology-ch-16', 'Respiratory Radiology', 'radiology', ['Respiratory Radiology']),
  makeChapter('radiology-ch-17', 'Nuclear Medicine', 'radiology', ['Nuclear Medicine']),
  makeChapter('radiology-ch-18', 'Radiotherapy', 'radiology', ['Radiotherapy Part 1', 'Radiotherapy Part 2']),
  makeChapter('radiology-ch-19', 'Radiological Anatomy', 'radiology', ['Radiological Anatomy']),

  // ═══════════════════════════════════════
  // ANESTHESIA
  // ═══════════════════════════════════════
  makeChapter('anesthesia-ch-1', 'History of Anaesthesia', 'anesthesia', ['History of Anaesthesia']),
  makeChapter('anesthesia-ch-2', 'Introduction of Anaesthesia', 'anesthesia', ['Introduction of Anaesthesia']),
  makeChapter('anesthesia-ch-3', 'Pre-Anaesthetic Evaluation', 'anesthesia', ['Pre-Anaesthetic Evaluation']),
  makeChapter('anesthesia-ch-4', 'Monitoring in Anaesthesia', 'anesthesia', ['Monitoring in Anaesthesia']),
  makeChapter('anesthesia-ch-5', 'Anesthesia Machine', 'anesthesia', ['Anesthesia Machine']),
  makeChapter('anesthesia-ch-6', 'Anaesthesia Circuit', 'anesthesia', ['Anaesthesia Circuit']),
  makeChapter('anesthesia-ch-7', 'Airway Management', 'anesthesia', ['Airway Management']),
  makeChapter('anesthesia-ch-8', 'Mechanical Ventilation', 'anesthesia', ['Mechanical Ventilation']),
  makeChapter('anesthesia-ch-9', 'Inhalational Anaesthetic Agents Part-I', 'anesthesia', ['Inhalational Anaesthetic Agents Part-I']),
  makeChapter('anesthesia-ch-10', 'Inhalational Anaesthetic Agents Part-II', 'anesthesia', ['Inhalational Anaesthetic Agents Part-II']),
  makeChapter('anesthesia-ch-11', 'Intravenous Anaesthetic Agents', 'anesthesia', ['Intravenous Anaesthetic Agents']),
  makeChapter('anesthesia-ch-12', 'Opioids', 'anesthesia', ['Opioids']),
  makeChapter('anesthesia-ch-13', 'Neuromuscular Blockers', 'anesthesia', ['Neuromuscular Blockers']),
  makeChapter('anesthesia-ch-14', 'Regional Anesthesia', 'anesthesia', ['Regional Anesthesia']),
  makeChapter('anesthesia-ch-15', 'Central Neuraxial Blockade', 'anesthesia', ['Central Neuraxial Blockade']),
  makeChapter('anesthesia-ch-16', 'Perioperative Fluids', 'anesthesia', ['Perioperative Fluids']),
  makeChapter('anesthesia-ch-17', 'Post Anaesthesia Care', 'anesthesia', ['Post Anaesthesia Care']),
  makeChapter('anesthesia-ch-18', 'Oxygen Therapy', 'anesthesia', ['Oxygen Therapy']),
  makeChapter('anesthesia-ch-19', 'Cardiopulmonary Resuscitation', 'anesthesia', ['Cardiopulmonary Resuscitation']),
  makeChapter('anesthesia-ch-20', 'Brain Death', 'anesthesia', ['Brain Death']),

  // ═══════════════════════════════════════
  // OPHTHALMOLOGY
  // ═══════════════════════════════════════
  makeChapter('ophthalmology-ch-1', 'Basics of Ophthalmology', 'ophthalmology', [
    'Introduction to Ophthalmology', 'Basics of Ophthalmology Part - I',
    'Basics of Ophthalmology Part - II', 'Embryology of the eye',
  ]),
  makeChapter('ophthalmology-ch-2', 'Orbit and Adnexa', 'ophthalmology', [
    'Orbit and adnexa', 'Lacrimal apparatus',
  ]),
  makeChapter('ophthalmology-ch-3', 'Lens and Cataract', 'ophthalmology', [
    'Cataract part - 1', 'Cataract part - 2',
  ]),
  makeChapter('ophthalmology-ch-4', 'Uveitis', 'ophthalmology', ['Uveitis']),
  makeChapter('ophthalmology-ch-5', 'Glaucoma', 'ophthalmology', [
    'Glaucoma Part 1', 'Glaucoma Part 2', 'Glaucoma Part 3',
  ]),
  makeChapter('ophthalmology-ch-6', 'Refraction', 'ophthalmology', [
    'Refraction Part 1', 'Refraction Part 2',
  ]),
  makeChapter('ophthalmology-ch-7', 'Retina and Vitreous', 'ophthalmology', [
    'Part 1', 'Part 2', 'Part 3', 'Hypertensive retinopathy',
  ]),
  makeChapter('ophthalmology-ch-8', 'Neuro Ophthalmology', 'ophthalmology', [
    'Part 1', 'Part 2',
  ]),
  makeChapter('ophthalmology-ch-9', 'Squint / Strabismus', 'ophthalmology', [
    'Part 1', 'Part 2',
  ]),
  makeChapter('ophthalmology-ch-10', 'Conjunctiva', 'ophthalmology', ['Conjunctiva']),
  makeChapter('ophthalmology-ch-11', 'Cornea', 'ophthalmology', ['Part 1', 'Part 2']),
  makeChapter('ophthalmology-ch-12', 'Sclera', 'ophthalmology', ['Episcleritis and devastating scleritis']),
  makeChapter('ophthalmology-ch-13', 'Trauma', 'ophthalmology', ['Ocular trauma', 'Chemical injuries']),
  makeChapter('ophthalmology-ch-14', 'Imaging in Ophthalmology', 'ophthalmology', ['Imaging in ophthalmology']),
  makeChapter('ophthalmology-ch-15', 'Lasers in Ophthalmology', 'ophthalmology', ['Lasers in Ophthalmology']),

  // ═══════════════════════════════════════
  // ENT
  // ═══════════════════════════════════════
  makeChapter('ent-ch-1', 'Ear', 'ent', [
    'Fundamentals of ear (Osteology and Embryology)', 'Anatomy of external ear',
    'Diseases of external ear', 'Anatomy of middle ear cleft',
    'Eustachian tube (Anatomy, physiology and diagnostic tests)',
    'Anatomy of inner ear', 'Neural pathway of sound', 'Physiology of hearing',
    'Tests of hearing', 'Facial nerve and its disorders', 'Otitis media',
    'Complications of otitis media', 'Otosclerosis', 'Glomus tumor',
    'Diseases of inner ear', 'Anatomy and diseases of CP angle',
    'Hearing devices', 'Vestibular Schwannoma',
  ]),
  makeChapter('ent-ch-2', 'Nose and Paranasal Sinuses', 'ent', [
    'Congenital lesions of nose', 'CSF rhinorrhoea', 'Fungal rhinosinusitis',
    'X-rays of paranasal sinuses', 'Rhinosinusitis', 'Nasal disorders of atrophy',
    'Embryology of nose and face', 'Introduction to paranasal sinuses',
    'Blood supply of nasal septum and epistaxis', 'Paranasal sinuses anatomy',
    'Tumors of nose and paranasal sinuses', 'Anatomy of nasal cavity',
    'Anatomy and disorders of external nose', 'Complications of sinusitis',
    'Nasal septal disorders', 'Nasal polyps', 'Physiology of nose',
  ]),
  makeChapter('ent-ch-3', 'Pharynx', 'ent', [
    'Introduction to pharynx', 'Nasopharynx', 'Hypopharynx', 'Oropharynx',
    'Layers of cervical fascia', 'Deep neck spaces',
  ]),
  makeChapter('ent-ch-4', 'Larynx', 'ent', [
    'Embryology of larynx', 'Structural anatomy of larynx',
    'Acute and chronic inflammation of larynx', 'Benign lesions of larynx',
    'Vocal fold palsy', 'Carcinoma larynx',
  ]),

  // ═══════════════════════════════════════
  // ORTHOPEDICS
  // ═══════════════════════════════════════
  makeChapter('orthopedics-ch-1', 'Bone and Imaging', 'orthopedics', [
    'Bone Structure', 'Parathyroid-Hormone on Bone',
    'Approach to Normal Limb X Rays in Orthopaedics',
  ]),
  makeChapter('orthopedics-ch-2', 'Bone and Joint Infections', 'orthopedics', [
    'Osteomyelitis', 'Chronic Osteomyelitis', 'Joint and Soft Tissue Infections',
  ]),
  makeChapter('orthopedics-ch-3', 'Tuberculosis of Bone and Joints', 'orthopedics', [
    'Tuberculosis of Bone and Joints',
  ]),
  makeChapter('orthopedics-ch-4', 'Orthopaedics Oncology', 'orthopedics', [
    'General Principles of Bone Tumors', 'Benign Bone Tumors', 'Malignant Bone Tumors',
  ]),
  makeChapter('orthopedics-ch-5', 'Nerve Injuries', 'orthopedics', [
    'Nerve Injuries I', 'Nerve Injuries II',
  ]),
  makeChapter('orthopedics-ch-6', 'General + Upper Limb Traumatology', 'orthopedics', [
    'Trauma General', 'Upper Limb - I', 'Upper Limb - II',
  ]),
  makeChapter('orthopedics-ch-7', 'Spine + Pelvis + Lower Limb Traumatology', 'orthopedics', [
    'Spine', 'Pelvis and Lower Limb', 'Fracture Management',
  ]),
  makeChapter('orthopedics-ch-8', 'Arthritis', 'orthopedics', ['Joint Disorders']),
  makeChapter('orthopedics-ch-9', 'Metabolic Disorders', 'orthopedics', [
    'Metabolic Disorders-I', 'Metabolic Disorders-II',
  ]),
  makeChapter('orthopedics-ch-10', 'Sports Injury & NM Disorders', 'orthopedics', [
    'Amputations and Sports Injury', 'Neuromuscular Disorders',
  ]),
  makeChapter('orthopedics-ch-11', 'Pediatric Orthopedics', 'orthopedics', [
    'Pediatric Orthopaedics-I', 'Pediatric Orthopaedics-II',
  ]),

  // ═══════════════════════════════════════
  // PSM (Social & Preventive Medicine)
  // ═══════════════════════════════════════
  makeChapter('psm-ch-1', 'COVID-19', 'psm', [
    'Basic steps of donning and doffing PPE', 'Black fungus Mucormycosis',
    'Covid-19 Biomedical waste management', 'Covid-19 Vaccines',
    'Recent Updates 2021', 'New updated values criteria definitions 2021-22',
  ]),
  makeChapter('psm-ch-2', 'Epidemiology', 'psm', [
    'Definitions and concepts', 'Classification, cohort study',
    'Case control study, combined designs', 'Other analytical studies',
    'Confounding and bias', 'RCT, trials', 'EBM, Meta-analysis, other studies',
    'Meta-analysis', 'Forest plot', 'Funnel plot',
    'Disease causation, measurements, milestones',
  ]),
  makeChapter('psm-ch-3', 'Vaccines and Cold Chain', 'psm', [
    'Concepts of immunity, classification of vaccines',
    'National immunization schedule 2020-21', 'Contraindications, AEFIs',
    'Cold chain in India', 'Important facts in immunization',
  ]),
  makeChapter('psm-ch-4', 'Health and Disease', 'psm', [
    'PQLI, HDI, MDPI, BPL', 'Time distribution, epidemics',
    'Elimination, eradication, surveillance', 'Levels of prevention of disease',
    'Other key definitions and concepts',
  ]),
  makeChapter('psm-ch-5', 'Screening of Disease', 'psm', [
    'Definition and concepts, examples from NHPs',
    'Sensitivity, specificity, PPV, NPV', 'ROC curve, precision & accuracy',
    'Likelihood ratios',
  ]),
  makeChapter('psm-ch-6', 'Demography', 'psm', [
    'Definition and concepts', 'Census, SRS, NFHS, DLHS, VRS', 'Other key concepts',
  ]),
  makeChapter('psm-ch-7', 'Preventive Obstetrics, Pediatrics and Geriatrics', 'psm', [
    'Obstetric care in RCH', 'Pediatric care in RCH',
    'Growth and development', 'School health, geriatrics',
  ]),
  makeChapter('psm-ch-8', 'Nutrition and Health', 'psm', [
    'Nutrition guidelines 2021-22', 'Definition and concepts',
    'Proteins, fats, rich sources', 'RDA, nutritional requirements',
    'Vitamins and nutritional deficiencies', 'Food standards, food adulteration',
  ]),
  makeChapter('psm-ch-9', 'Social Sciences and Health', 'psm', [
    'Definition and concepts in sociology & psychology',
    'Family systems in India', 'Socio-economic status, Social security', 'Health economics',
  ]),
  makeChapter('psm-ch-10', 'Environment and Health', 'psm', [
    'Water', 'Air, light, sound, housing, radiation, waste disposal', 'Medical entomology',
  ]),
  makeChapter('psm-ch-11', 'International Health', 'psm', [
    'International health agencies', 'Bioterrorism agents',
    'Sustainable development goals', 'Biosafety levels',
  ]),
  makeChapter('psm-ch-12', 'Health Education and Communication', 'psm', [
    'Definitions and concepts', 'HC methods, D-P communication',
    'Health education, mass media', 'National education policy 2020',
  ]),
  makeChapter('psm-ch-13', 'Health Care in India', 'psm', [
    'PH care, elements & principles', 'Rural and urban health centers, workers, norms',
    'AYUSH, socialized medicine',
  ]),
  makeChapter('psm-ch-14', 'Family Planning and Contraception', 'psm', [
    'Definitions and concepts', 'Natural methods, barrier methods, IUSs, OCPs',
    'Other FP methods', 'New initiatives in family planning',
  ]),
  makeChapter('psm-ch-15', 'Communicable and Non-Communicable Disease', 'psm', [
    'General epidemiology', 'Respiratory infections',
    'Intestinal infections, worm infections',
    'VBDs, arboviral & viral infections, surface infections',
    'Leprosy, HIV & STDs', 'Other communicable diseases',
    'NCDs: CHD, HTN, DM, RF, Cancers, Obesity, Blindness',
  ]),
  makeChapter('psm-ch-16', 'National Health Programmes', 'psm', [
    'National Tuberculosis elimination program 2020-21', 'RNTCP', 'NPEP, NHM',
    'NPCBVI, NACP', 'NVBDCP, NLEP', 'Other NHPs',
    'New national health programs in India', 'National digital health mission',
    'Health schemes', 'New schemes strategies initiatives 2021-22',
    'Health policies & legislations',
  ]),
  makeChapter('psm-ch-17', 'Allied Health Disciplines', 'psm', [
    'Biomedical waste management', 'Disaster management',
    'Occupational health', 'Genetics and health', 'Mental health',
  ]),
  makeChapter('psm-ch-18', 'Health Planning and Management', 'psm', [
    'Definitions and concepts in HP', 'HP committees',
    'National health policy 2017', 'HM techniques, inventory control',
  ]),
  makeChapter('psm-ch-19', 'Biostatistics', 'psm', [
    'Variables, scales', 'Central tendency, dispersion',
    'Normal distribution, skewed distributions',
    'Statistical errors, p-value, confidence intervals', 'Statistical tests',
    'Statistical graphs, correlation, regression, locations',
    'Sampling, sample size', 'Probability & odds', 'Tree diagram',
    'Box and whisker plot', 'Stem and leaf plot',
  ]),
];
