/* Inheritance calculator UI (Egyptian law 77/1943, 71/1946). Uses calc-engine.js. Mount: HQCalc.mount(el,{source,token()}) */
(function () {
  var E = window.InheritanceEngine, F = E.F;
  var GROUPS = [
    ['sp', ['husband', 'wife']],
    ['as', ['father', 'mother', 'grandfatherFather', 'grandfatherFatherFather', 'grandmotherFather', 'grandmotherMother', 'grandmotherMotherMother', 'grandmotherFatherFather', 'grandmotherMotherFather']],
    ['de', ['sons', 'daughters', 'sonSons', 'sonDaughters', 'sonSonSons', 'sonSonDaughters', 'sonSonSonSons', 'sonSonSonDaughters']],
    ['si', ['fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters', 'maternalBrothers', 'maternalSisters']],
    ['ns', ['sonFullBrothers', 'sonPaternalBrothers', 'sonSonFullBrothers', 'sonSonPaternalBrothers']],
    ['un', ['fullUncles', 'paternalUncles', 'sonFullUncles', 'sonPaternalUncles', 'sonSonFullUncles', 'sonSonPaternalUncles', 'grandfatherFullBrothers', 'grandfatherPaternalBrothers', 'sonGrandfatherFullBrothers', 'sonGrandfatherPaternalBrothers']],
    ['ar', E.ARHAM_IDS]
  ];
  var EN = { baytMal: 'Public treasury (Bayt al-Mal)', husband: 'Husband', wife: 'Wife', father: 'Father', mother: 'Mother', grandfatherFather: "Grandfather (father's father)", grandfatherFatherFather: "Great-grandfather (father's father's father)", grandmotherFather: "Grandmother (father's mother)", grandmotherMother: "Grandmother (mother's mother)", grandmotherMotherMother: "Grandmother (mother's mother's mother)", grandmotherFatherFather: "Grandmother (father's father's mother)", grandmotherMotherFather: "Grandmother (father's mother's mother)", sons: 'Son', daughters: 'Daughter', sonSons: "Son's son", sonDaughters: "Son's daughter", sonSonSons: "Son's son's son", sonSonDaughters: "Son's son's daughter", sonSonSonSons: "Son's son's son's son", sonSonSonDaughters: "Son's son's son's daughter", fullBrothers: 'Full brother', fullSisters: 'Full sister', paternalBrothers: 'Half-brother (same father)', paternalSisters: 'Half-sister (same father)', maternalBrothers: 'Half-brother (same mother)', maternalSisters: 'Half-sister (same mother)', sonFullBrothers: "Full brother's son", sonPaternalBrothers: "Paternal half-brother's son", sonSonFullBrothers: "Full brother's son's son", sonSonPaternalBrothers: "Paternal half-brother's son's son", fullUncles: 'Full paternal uncle', paternalUncles: 'Paternal half-uncle (same grandfather)', sonFullUncles: "Full paternal uncle's son", sonPaternalUncles: "Paternal half-uncle's son", sonSonFullUncles: "Full paternal uncle's son's son", sonSonPaternalUncles: "Paternal half-uncle's son's son", grandfatherFullBrothers: "Father's full paternal uncle", grandfatherPaternalBrothers: "Father's paternal half-uncle", sonGrandfatherFullBrothers: "Son of father's full paternal uncle", sonGrandfatherPaternalBrothers: "Son of father's paternal half-uncle", dSons: "Daughter's son", dDaughters: "Daughter's daughter", grandfatherMother: "Maternal grandfather (mother's father)", brotherDaughtersFull: "Full brother's daughter", brotherDaughtersPaternal: "Paternal half-brother's daughter", sisterSonsFull: "Full sister's son", sisterDaughtersFull: "Full sister's daughter", sisterSonsPaternal: "Paternal half-sister's son", sisterDaughtersPaternal: "Paternal half-sister's daughter", maternalSibSons: "Maternal half-sibling's son", maternalSibDaughters: "Maternal half-sibling's daughter", aunt: 'Paternal aunt', uncleMaternal: "Father's maternal half-uncle", maternalUncle: 'Maternal uncle', maternalAunt: 'Maternal aunt' };
  var FR = { baytMal: 'Trésor public (Bayt al-Mal)', husband: 'Époux', wife: 'Épouse', father: 'Père', mother: 'Mère', grandfatherFather: 'Grand-père (père du père)', grandfatherFatherFather: 'Arrière-grand-père (père du père du père)', grandmotherFather: 'Grand-mère (mère du père)', grandmotherMother: 'Grand-mère (mère de la mère)', grandmotherMotherMother: 'Grand-mère (mère de la mère de la mère)', grandmotherFatherFather: 'Grand-mère (mère du père du père)', grandmotherMotherFather: 'Grand-mère (mère de la mère du père)', sons: 'Fils', daughters: 'Fille', sonSons: 'Fils du fils', sonDaughters: 'Fille du fils', sonSonSons: 'Fils du fils du fils', sonSonDaughters: 'Fille du fils du fils', sonSonSonSons: 'Fils du fils du fils du fils', sonSonSonDaughters: 'Fille du fils du fils du fils', fullBrothers: 'Frère germain', fullSisters: 'Sœur germaine', paternalBrothers: 'Demi-frère consanguin', paternalSisters: 'Demi-sœur consanguine', maternalBrothers: 'Demi-frère utérin', maternalSisters: 'Demi-sœur utérine', sonFullBrothers: 'Fils du frère germain', sonPaternalBrothers: 'Fils du demi-frère consanguin', sonSonFullBrothers: 'Fils du fils du frère germain', sonSonPaternalBrothers: 'Fils du fils du demi-frère consanguin', fullUncles: 'Oncle paternel germain', paternalUncles: 'Oncle paternel consanguin', sonFullUncles: "Fils de l'oncle paternel germain", sonPaternalUncles: "Fils de l'oncle paternel consanguin", sonSonFullUncles: "Fils du fils de l'oncle paternel germain", sonSonPaternalUncles: "Fils du fils de l'oncle paternel consanguin", grandfatherFullBrothers: "Oncle germain du père", grandfatherPaternalBrothers: "Oncle consanguin du père", sonGrandfatherFullBrothers: "Fils de l'oncle germain du père", sonGrandfatherPaternalBrothers: "Fils de l'oncle consanguin du père", dSons: 'Fils de la fille', dDaughters: 'Fille de la fille', grandfatherMother: 'Grand-père maternel (père de la mère)', brotherDaughtersFull: 'Fille du frère germain', brotherDaughtersPaternal: 'Fille du demi-frère consanguin', sisterSonsFull: 'Fils de la sœur germaine', sisterDaughtersFull: 'Fille de la sœur germaine', sisterSonsPaternal: 'Fils de la sœur consanguine', sisterDaughtersPaternal: 'Fille de la sœur consanguine', maternalSibSons: 'Fils du demi-frère ou de la demi-sœur utérin(e)', maternalSibDaughters: 'Fille du demi-frère ou de la demi-sœur utérin(e)', aunt: 'Tante paternelle', uncleMaternal: "Oncle utérin du père", maternalUncle: 'Oncle maternel', maternalAunt: 'Tante maternelle' };
  var T = {
    ar: { title: 'حاسبة المواريث', sub: 'وفق القانون المصري (ق٧٧/١٩٤٣ وق٧١/١٩٤٦). للأغراض التعليمية ولا تغني عن استشارة محامٍ.', s1: 'التركة', s2: 'الورثة', s3: 'حالات خاصة', s4: 'مراجعة', s5: 'النتيجة', gender: 'جنس المتوفى', male: 'ذكر', female: 'أنثى', gross: 'قيمة التركة', funeral: 'تكاليف التجهيز والدفن', debts: 'الديون', will: 'وصية اختيارية (مبلغ)', willOk: 'أجاز الورثة الوصية بأكثر من الثلث', optional: 'اختياري', next: 'التالي', back: 'السابق', calc: 'احسب', g_sp: 'الزوجية', g_as: 'الأصول', g_de: 'الفروع', g_si: 'الإخوة والأخوات', g_ns: 'أولاد الإخوة', g_un: 'الأعمام وأولادهم', g_ar: 'ذوو الأرحام', blocked: 'محجوب', by: 'بسبب', hint: 'اضغط + لإضافة وارث. الورثة المحجوبون يظهرون تلقائيًا بلون باهت مع السبب.', barred: 'مانع من الإرث (قتل أو اختلاف دين)', barredHint: 'حدّد من يُمنع من الإرث، وهو لا يحجب غيره (م٢٤).', preg: 'يوجد حمل', pregKind: 'الحمل هو', pk_child: 'ولد للمتوفى', pk_sonChild: 'ولد ابن للمتوفى', pk_fullSibling: 'أخ/أخت شقيقة', pk_paternalSibling: 'أخ/أخت لأب', pred: 'ابن أو بنت توفي قبل المتوفى وله أولاد (وصية واجبة)', predKind: 'المتوفى سابقًا', son: 'ابن', daughter: 'بنت', gsons: 'عدد الأحفاد الذكور', gdaughters: 'عدد الحفيدات', gift: 'هبة من المتوفى للأحفاد', add: 'إضافة', review: 'راجع كل الورثة قبل الحساب. اضغط تعديل للرجوع.', edit: 'تعديل', none: 'لم تختر أي وارث', heir: 'الوارث', cnt: 'العدد', share: 'النصيب', units: 'السهام', amount: 'المبلغ', each: 'لكل فرد', why: 'السبب', proof: 'الدليل', ref: 'رقم المسألة', print: 'طباعة على ورق المكتب', newc: 'مسألة جديدة', steps: 'خطوات الحل السبع', blk: 'الورثة المحجوبون', net: 'صافي التركة', wajiba: 'الوصية الواجبة', willv: 'الوصية الاختيارية', dist: 'المتاح للتوزيع على الورثة', flags: 'مسائل خلافية بين العلماء', evid: 'أدلة المسألة', langnote: 'الشرح الشرعي والأدلة بالعربية لغة النص.', disclaimer: 'نتيجة تعليمية مبنية على القواعد المنشورة، وقد تختلف حالتك بوقائعها ومستنداتها. لا تُغني عن استشارة محامٍ.', ifmale: 'لو ذكر', iffemale: 'لو أنثى', ifnot: 'لو لم يولد حيًا', now: 'يُعطى الآن', unborn: 'الحمل', reserve: 'الموقوف للحمل', khuntha: 'لو خنثى مشكل (م٤٦)', pregT: 'نتيجة الحمل بثلاثة فروض', cur: 'جنيه', errEmpty: 'اختر وارثًا واحدًا على الأقل', office: 'الحقانية للاستشارات القانونية', city: 'الإسكندرية، مصر', date: 'التاريخ', wnote: 'تنبيه الطباعة: هذه الصفحة نتيجة آلية ولا تُعد حكمًا.', open: 'فتح بالرقم', openPh: 'MR-2611-ABC123', openBtn: 'فتح', notfound: 'رقم غير موجود', saved: 'تم حفظ المسألة', total: 'المجموع' },
    en: { title: 'Inheritance Calculator', sub: 'Under Egyptian law (Law 77/1943 and Law 71/1946). Educational only; not a substitute for a lawyer.', s1: 'Estate', s2: 'Heirs', s3: 'Special cases', s4: 'Review', s5: 'Result', gender: 'Gender of the deceased', male: 'Male', female: 'Female', gross: 'Estate value', funeral: 'Funeral and burial costs', debts: 'Debts', will: 'Voluntary bequest (amount)', willOk: 'Heirs approved a bequest above one third', optional: 'optional', next: 'Next', back: 'Back', calc: 'Calculate', g_sp: 'Spouses', g_as: 'Ascendants', g_de: 'Descendants', g_si: 'Siblings', g_ns: "Siblings' children", g_un: 'Uncles and their children', g_ar: 'Distant kindred (dhawu al-arham)', blocked: 'Blocked', by: 'by', hint: 'Tap + to add an heir. Blocked heirs appear faded with the reason.', barred: 'Barred from inheriting (killing or different religion)', barredHint: 'Mark who is barred. A barred person does not block others (art. 24).', preg: 'A pregnancy exists', pregKind: 'The unborn is', pk_child: "decedent's child", pk_sonChild: "child of decedent's son", pk_fullSibling: 'full sibling', pk_paternalSibling: 'paternal half-sibling', pred: 'A son or daughter died before the deceased and left children (obligatory bequest)', predKind: 'Predeceased', son: 'son', daughter: 'daughter', gsons: 'Grandsons', gdaughters: 'Granddaughters', gift: 'Gift from the deceased to them', add: 'Add', review: 'Review all heirs before calculating. Tap Edit to go back.', edit: 'Edit', none: 'No heir selected', heir: 'Heir', cnt: 'Count', share: 'Share', units: 'Units', amount: 'Amount', each: 'Per person', why: 'Reason', proof: 'Evidence', ref: 'Problem no.', print: 'Print on office letterhead', newc: 'New problem', steps: 'The seven solution steps', blk: 'Blocked heirs', net: 'Net estate', wajiba: 'Obligatory bequest', willv: 'Voluntary bequest', dist: 'Available for heirs', flags: 'Points scholars disagree on', evid: 'Evidence for this problem', langnote: 'Legal explanations and evidence are shown in Arabic, the language of the text.', disclaimer: 'Educational result based on the published rules. Your case may differ in its facts and documents. Not a substitute for a lawyer.', ifmale: 'If male', iffemale: 'If female', ifnot: 'If not born alive', now: 'Given now', unborn: 'Unborn child', reserve: 'Reserved for the unborn', khuntha: 'If indeterminate (art. 46)', pregT: 'Pregnancy: three scenarios', cur: 'EGP', errEmpty: 'Select at least one heir', office: 'Elhaqania Legal Consultation', city: 'Alexandria, Egypt', date: 'Date', wnote: 'Note: automatic result, not a legal ruling.', open: 'Open by number', openPh: 'MR-2611-ABC123', openBtn: 'Open', notfound: 'Number not found', saved: 'Saved', total: 'Total' },
    fr: { title: "Calculateur d'héritage", sub: "Selon le droit égyptien (loi 77/1943 et loi 71/1946). Usage éducatif, ne remplace pas un avocat.", s1: 'Succession', s2: 'Héritiers', s3: 'Cas particuliers', s4: 'Vérification', s5: 'Résultat', gender: 'Sexe du défunt', male: 'Homme', female: 'Femme', gross: 'Valeur de la succession', funeral: 'Frais funéraires', debts: 'Dettes', will: 'Legs volontaire (montant)', willOk: "Les héritiers ont approuvé un legs supérieur au tiers", optional: 'facultatif', next: 'Suivant', back: 'Retour', calc: 'Calculer', g_sp: 'Conjoints', g_as: 'Ascendants', g_de: 'Descendants', g_si: 'Frères et sœurs', g_ns: 'Enfants des frères', g_un: 'Oncles et leurs enfants', g_ar: 'Parents éloignés (dhawu al-arham)', blocked: 'Exclu', by: 'par', hint: "Touchez + pour ajouter un héritier. Les héritiers exclus apparaissent estompés avec la raison.", barred: "Empêché d'hériter (meurtre ou religion différente)", barredHint: "Indiquez qui est empêché. Il n'exclut personne (art. 24).", preg: 'Une grossesse existe', pregKind: "L'enfant à naître est", pk_child: 'enfant du défunt', pk_sonChild: 'enfant du fils du défunt', pk_fullSibling: 'frère ou sœur germain(e)', pk_paternalSibling: 'demi-frère ou demi-sœur consanguin(e)', pred: "Un fils ou une fille est décédé avant le défunt et a laissé des enfants (legs obligatoire)", predKind: 'Prédécédé', son: 'fils', daughter: 'fille', gsons: 'Petits-fils', gdaughters: 'Petites-filles', gift: 'Don du défunt à ceux-ci', add: 'Ajouter', review: 'Vérifiez tous les héritiers avant de calculer. Touchez Modifier pour revenir.', edit: 'Modifier', none: 'Aucun héritier choisi', heir: 'Héritier', cnt: 'Nombre', share: 'Part', units: 'Parts', amount: 'Montant', each: 'Par personne', why: 'Motif', proof: 'Preuve', ref: 'Problème n°', print: 'Imprimer sur papier à en-tête', newc: 'Nouveau problème', steps: 'Les sept étapes de la solution', blk: 'Héritiers exclus', net: 'Succession nette', wajiba: 'Legs obligatoire', willv: 'Legs volontaire', dist: 'Disponible pour les héritiers', flags: 'Points de désaccord entre savants', evid: 'Preuves du problème', langnote: 'Les explications juridiques et les preuves sont en arabe, langue du texte.', disclaimer: "Résultat éducatif fondé sur les règles publiées. Votre cas peut différer par ses faits et ses documents. Ne remplace pas un avocat.", ifmale: 'Si garçon', iffemale: 'Si fille', ifnot: 'Si non né vivant', now: 'Donné maintenant', unborn: "Enfant à naître", reserve: "Réservé à l'enfant à naître", khuntha: 'Si indéterminé (art. 46)', pregT: 'Grossesse : trois hypothèses', cur: 'EGP', errEmpty: 'Choisissez au moins un héritier', office: 'Elhaqania Legal Consultation', city: 'Alexandrie, Égypte', date: 'Date', wnote: 'Note : résultat automatique, pas une décision juridique.', open: 'Ouvrir par numéro', openPh: 'MR-2611-ABC123', openBtn: 'Ouvrir', notfound: 'Numéro introuvable', saved: 'Enregistré', total: 'Total' }
  };
  var LOGO = 'https://jfa9qoskskljefrl.public.blob.vercel-storage.com/logo-256-tEnQxVzMtiqKb5NA53vDpz8hV6bTvu.webp';
  function lang() { try { return localStorage.getItem('siteLang') || 'ar'; } catch (e) { return 'ar'; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('hqcalc-css')) return;
    var s = document.createElement('style'); s.id = 'hqcalc-css';
    s.textContent = '.hqc{max-width:960px;margin:0 auto;background:#fff;color:#222;border-radius:14px;padding:22px;box-shadow:0 4px 24px rgba(0,0,0,.12);font-family:Cairo,sans-serif;line-height:1.7}.hqc h2{color:#b59461;margin:0 0 4px}.hqc .sub{color:#666;font-size:.9rem;margin-bottom:14px}.hqc .steps{display:flex;gap:6px;margin:12px 0 18px;flex-wrap:wrap}.hqc .st{flex:1;min-width:70px;text-align:center;padding:6px 4px;border-radius:20px;background:#eee;font-size:.8rem;color:#555}.hqc .st.on{background:#b59461;color:#fff;font-weight:700}.hqc .st.done{background:#e8dcc7}.hqc label{display:block;font-weight:600;margin:10px 0 4px}.hqc input[type=number],.hqc input[type=text],.hqc select{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;font:inherit;box-sizing:border-box}.hqc .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:600px){.hqc .row2{grid-template-columns:1fr}}.hqc .grp{margin-top:14px}.hqc .grp h3{font-size:1rem;color:#111;background:#f4efe6;padding:6px 12px;border-radius:8px;margin:0 0 8px}.hqc .hr{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #eee}.hqc .hr .n{flex:1}.hqc .hr.bl{opacity:.45;background:repeating-linear-gradient(45deg,#fafafa,#fafafa 6px,#f0f0f0 6px,#f0f0f0 12px)}.hqc .hr.bl .n{text-decoration:line-through}.hqc .hr small{color:#a33;display:block;text-decoration:none}.hqc .ctl button{width:34px;height:34px;border-radius:50%;border:1px solid #b59461;background:#fff;color:#b59461;font-size:1.2rem;cursor:pointer}.hqc .ctl b{display:inline-block;min-width:26px;text-align:center}.hqc .btn{background:#b59461;color:#fff;border:0;border-radius:24px;padding:11px 28px;font:inherit;font-weight:700;cursor:pointer;margin:6px 4px}.hqc .btn.s{background:#333}.hqc .btn.l{background:#fff;color:#b59461;border:1px solid #b59461}.hqc .nav{display:flex;justify-content:space-between;margin-top:18px}.hqc table{width:100%;border-collapse:collapse;margin:10px 0;font-size:.92rem}.hqc th,.hqc td{border:1px solid #ddd;padding:7px 8px;text-align:start;vertical-align:top}.hqc th{background:#111;color:#e8c872}.hqc .box{background:#faf7f0;border-inline-start:4px solid #b59461;padding:10px 14px;border-radius:8px;margin:10px 0}.hqc .ev{font-size:.85rem;color:#444;display:none;margin-top:4px}.hqc .ev.on{display:block}.hqc a.lnk{color:#b59461;cursor:pointer;font-size:.85rem}.hqc .ref{font-weight:700;font-size:1.1rem;color:#111;direction:ltr;display:inline-block}.hqc .err{color:#b00;margin:8px 0}.hqc .warn{background:#fff4e5;border:1px solid #f0c987;padding:8px 12px;border-radius:8px;font-size:.88rem;margin:8px 0}.hqc .chk{display:flex;gap:8px;align-items:center;margin:8px 0}.hqc .chk input{width:auto}#hqPrint{display:none}@media print{body>*:not(#hqPrint){display:none!important}#hqPrint{display:block!important;direction:rtl;font-family:Cairo,sans-serif;color:#000}#hqPrint .pg{position:relative;min-height:270mm;padding:14mm 12mm 26mm;border:3px double #b59461;box-sizing:border-box}#hqPrint .lh{display:flex;align-items:center;gap:12px;border-bottom:2px solid #b59461;padding-bottom:8px;margin-bottom:12px}#hqPrint .lh img{height:60px}#hqPrint .ft{position:absolute;bottom:8mm;left:12mm;right:12mm;text-align:center;font-size:11px;border-top:1px solid #b59461;padding-top:5px;color:#333}#hqPrint table{width:100%;border-collapse:collapse;font-size:12px}#hqPrint th,#hqPrint td{border:1px solid #888;padding:4px 6px;text-align:start}#hqPrint th{background:#eee}#hqPrint .wm{position:absolute;inset:0;background:url(' + LOGO + ') center/55% no-repeat;opacity:.07;pointer-events:none}}';
    document.head.appendChild(s);
  }

  function mount(el, o) {
    o = o || {}; css();
    var S = { step: 1, gender: 'male', inp: {}, barred: {}, est: { gross: '', funeral: '', debts: '', will: '', willOk: false }, preg: false, pregKind: 'child', pred: [], res: null, ref: '' };
    var L = lang();
    function t(k) { return (T[L] || T.ar)[k] || T.ar[k] || k; }
    function nm(id) { return L === 'en' ? (EN[id] || E.nm(id)) : L === 'fr' ? (FR[id] || E.nm(id)) : E.nm(id); }
    function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString(L === 'ar' ? 'en-US' : L === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 }); }
    function ftxt(fr) { return F.txt(fr); }
    function lim(id) { return id === 'husband' ? 1 : id === 'wife' ? 4 : (/^(father|mother|grandfather|grandmother)/.test(id) ? 1 : 30); }
    function cleanInp() { var r = {}; Object.keys(S.inp).forEach(function (k) { if (S.inp[k] > 0) r[k] = S.inp[k]; }); if (S.gender === 'male') delete r.husband; else delete r.wife; return r; }
    function barredList() { return Object.keys(S.barred).filter(function (k) { return S.barred[k] && S.inp[k] > 0; }); }
    function solveNow() { try { return E.solve(cleanInp(), { barred: barredList() }); } catch (e) { return null; } }
    function stepsBar() { var n = [t('s1'), t('s2'), t('s3'), t('s4'), t('s5')]; return '<div class="steps">' + n.map(function (x, i) { return '<div class="st ' + (S.step === i + 1 ? 'on' : S.step > i + 1 ? 'done' : '') + '">' + (i + 1) + '. ' + esc(x) + '</div>'; }).join('') + '</div>'; }
    function head() { return '<h2>🧮 ' + esc(t('title')) + '</h2><div class="sub">' + esc(t('sub')) + '</div>'; }

    function v1() {
      return '<div class="row2"><div><label>' + esc(t('gender')) + '</label><select id="c_g"><option value="male"' + (S.gender === 'male' ? ' selected' : '') + '>' + t('male') + '</option><option value="female"' + (S.gender === 'female' ? ' selected' : '') + '>' + t('female') + '</option></select></div>' +
        '<div><label>' + esc(t('gross')) + ' (' + t('cur') + ') <small>' + t('optional') + '</small></label><input type="number" min="0" id="c_gross" value="' + esc(S.est.gross) + '"></div>' +
        '<div><label>' + esc(t('funeral')) + '</label><input type="number" min="0" id="c_fun" value="' + esc(S.est.funeral) + '"></div>' +
        '<div><label>' + esc(t('debts')) + '</label><input type="number" min="0" id="c_debt" value="' + esc(S.est.debts) + '"></div>' +
        '<div><label>' + esc(t('will')) + '</label><input type="number" min="0" id="c_will" value="' + esc(S.est.will) + '"></div></div>' +
        '<div class="chk"><input type="checkbox" id="c_wok"' + (S.est.willOk ? ' checked' : '') + '><span>' + esc(t('willOk')) + '</span></div>';
    }
    function v2() {
      var res = solveNow(), bl = {}; if (res) res.blocked.forEach(function (b) { bl[b.id] = b; });
      var h = '<div class="warn">' + esc(t('hint')) + '</div>';
      GROUPS.forEach(function (g) {
        var ids = g[1].filter(function (id) { return !(g[0] === 'sp' && ((id === 'husband' && S.gender === 'male') || (id === 'wife' && S.gender === 'female'))); });
        h += '<div class="grp"><h3>' + esc(t('g_' + g[0])) + '</h3>' + ids.map(function (id) {
          var c = S.inp[id] || 0, b = bl[id];
          return '<div class="hr' + (b ? ' bl' : '') + '"><div class="n">' + esc(nm(id)) + (b ? '<small>' + esc(t('blocked')) + ' ' + esc(t('by')) + ' ' + esc(b.by) + (b.law ? ' (' + esc(b.law) + ')' : '') + '</small>' : '') + '</div><div class="ctl"><button data-m="' + id + '">−</button> <b>' + c + '</b> <button data-p="' + id + '">+</button></div></div>';
        }).join('') + '</div>';
      });
      return h;
    }
    function v3() {
      var ids = Object.keys(cleanInp());
      var h = '<div class="box"><b>' + esc(t('barred')) + '</b><div class="sub">' + esc(t('barredHint')) + '</div>' + (ids.length ? ids.map(function (id) { return '<div class="chk"><input type="checkbox" data-bar="' + id + '"' + (S.barred[id] ? ' checked' : '') + '><span>' + esc(nm(id)) + '</span></div>'; }).join('') : '<div class="sub">' + esc(t('none')) + '</div>') + '</div>';
      h += '<div class="box"><div class="chk"><input type="checkbox" id="c_preg"' + (S.preg ? ' checked' : '') + '><b>' + esc(t('preg')) + '</b></div><div id="pregBox" style="display:' + (S.preg ? 'block' : 'none') + '"><label>' + esc(t('pregKind')) + '</label><select id="c_pk">' + ['child', 'sonChild', 'fullSibling', 'paternalSibling'].map(function (k) { return '<option value="' + k + '"' + (S.pregKind === k ? ' selected' : '') + '>' + esc(t('pk_' + k)) + '</option>'; }).join('') + '</select></div></div>';
      h += '<div class="box"><b>' + esc(t('pred')) + '</b>' + S.pred.map(function (p, i) { return '<div class="row2" style="margin-top:8px"><div><label>' + esc(t('predKind')) + '</label><select data-pk="' + i + '"><option value="son"' + (p.kind === 'son' ? ' selected' : '') + '>' + t('son') + '</option><option value="daughter"' + (p.kind === 'daughter' ? ' selected' : '') + '>' + t('daughter') + '</option></select></div><div><label>' + esc(t('gsons')) + '</label><input type="number" min="0" data-ps="' + i + '" value="' + (p.sons || 0) + '"></div><div><label>' + esc(t('gdaughters')) + '</label><input type="number" min="0" data-pd="' + i + '" value="' + (p.daughters || 0) + '"></div><div><label>' + esc(t('gift')) + '</label><input type="number" min="0" data-pg="' + i + '" value="' + (p.gift || 0) + '"></div></div>'; }).join('') + '<div><button class="btn l" id="c_addp">+ ' + esc(t('add')) + '</button></div></div>';
      return h;
    }
    function v4() {
      var inp = cleanInp(), ids = Object.keys(inp);
      var h = '<div class="warn">' + esc(t('review')) + '</div>';
      if (!ids.length) return h + '<div class="err">' + esc(t('errEmpty')) + '</div>';
      h += '<table><tr><th>' + t('heir') + '</th><th>' + t('cnt') + '</th></tr>' + ids.map(function (id) { return '<tr><td>' + esc(nm(id)) + (S.barred[id] ? ' <small>(' + esc(t('barred')) + ')</small>' : '') + '</td><td>' + inp[id] + '</td></tr>'; }).join('') + '</table>';
      var res = solveNow(); if (res && res.blocked.length) h += '<div class="box"><b>' + esc(t('blk')) + ':</b> ' + res.blocked.map(function (b) { return esc(nm(b.id)) + ' (' + esc(b.by) + ')'; }).join('، ') + '</div>';
      h += '<div class="box"><b>' + esc(t('s1')) + ':</b> ' + esc(t('gross')) + ' ' + fmt(+S.est.gross || 0) + ' | ' + esc(t('funeral')) + ' ' + fmt(+S.est.funeral || 0) + ' | ' + esc(t('debts')) + ' ' + fmt(+S.est.debts || 0) + ' | ' + esc(t('will')) + ' ' + fmt(+S.est.will || 0) + '</div>';
      if (S.preg) h += '<div class="box">🤰 ' + esc(t('preg')) + ': ' + esc(t('pk_' + S.pregKind)) + '</div>';
      S.pred.forEach(function (p) { h += '<div class="box">' + esc(t('pred')) + ': ' + esc(t(p.kind)) + ' (' + (p.sons || 0) + '/' + (p.daughters || 0) + ')</div>'; });
      return h;
    }
    function evHtml(r) { return r.evidence ? '<a class="lnk" data-ev="1">' + esc(t('proof')) + '</a><div class="ev">' + esc(r.evidence) + '</div>' : ''; }
    function money(fr, d) { return fmt(F.val(fr) * d); }
    function v5() {
      var R = S.res; if (!R) return '';
      var h = '<div class="box"><b>' + esc(t('ref')) + ':</b> <span class="ref">' + esc(S.ref || '...') + '</span></div>';
      var c = R.calc, res = c.result, dist = c.distributable;
      if (+c.gross) h += '<div class="box">' + esc(t('net')) + ': <b>' + fmt(c.net) + '</b> ' + t('cur') + (c.wajibaTotal ? ' | ' + esc(t('wajiba')) + ': <b>' + fmt(c.wajibaTotal) + '</b>' : '') + (c.will ? ' | ' + esc(t('willv')) + ': <b>' + fmt(c.will) + '</b>' : '') + ' | ' + esc(t('dist')) + ': <b>' + fmt(dist) + '</b></div>';
      (c.wajiba || []).forEach(function (w) { h += '<div class="box">' + esc(t('wajiba')) + ' (' + esc(t(w.kind)) + '): ' + (w.inherits ? esc(w.note) : '<b>' + fmt(w.amount) + '</b>') + '</div>'; });
      (c.notes || []).forEach(function (n) { h += '<div class="warn">' + esc(n) + '</div>'; });
      if (S.preg && R.preg) h += pregHtml(R.preg);
      else {
        h += '<table><tr><th>' + t('heir') + '</th><th>' + t('cnt') + '</th><th>' + t('share') + '</th><th>' + t('units') + '</th>' + (+c.gross ? '<th>' + t('amount') + '</th><th>' + t('each') + '</th>' : '') + '<th>' + t('why') + '</th></tr>' +
          res.rows.map(function (r) { return '<tr><td>' + esc(nm(r.id)) + '</td><td>' + r.count + '</td><td dir="ltr">' + ftxt(r.frac) + '</td><td>' + r.units + ' / ' + res.asl + '</td>' + (+c.gross ? '<td>' + money(r.frac, dist) + '</td><td>' + money(F.div(r.frac, F.make(r.count)), dist) + '</td>' : '') + '<td>' + esc(r.reason || '') + (r.law ? ' (' + esc(r.law) + ')' : '') + '<br>' + evHtml(r) + '</td></tr>'; }).join('') + '</table>';
      }
      if (res.blocked.length) h += '<div class="box"><b>' + esc(t('blk')) + ':</b> ' + res.blocked.map(function (b) { return esc(nm(b.id)) + ' (' + esc(b.by) + (b.law ? ' ' + esc(b.law) : '') + ')'; }).join('، ') + '</div>';
      (res.notes || []).forEach(function (n) { h += '<div class="warn">' + esc(n) + '</div>'; });
      if (res.flags.length) h += '<div class="box"><b>⚖ ' + esc(t('flags')) + '</b><ul>' + res.flags.map(function (f) { return '<li>' + esc(f.text) + '</li>'; }).join('') + '</ul></div>';
      var st = res.steps;
      h += '<div class="box"><b>' + esc(t('steps')) + '</b><ol><li>' + esc(st[1]) + '</li><li>' + esc(st[2]) + '</li><li>' + esc(st[3]) + '</li><li>' + esc(st[4]) + '</li><li>' + esc(st[5]) + '</li><li>' + (Array.isArray(st[6]) && st[6].length ? st[6].map(function (g) { return esc(nm(g.id)) + ': ' + g.heads + ' / ' + g.units + (g.relation ? ' (' + g.relation + ')' : ''); }).join('، ') : '—') + '</li><li>' + esc(st[7]) + '</li></ol></div>';
      var pe = res.evidenceSummary || [];
      if (pe.length) h += '<div class="box"><b>📖 ' + esc(t('evid')) + '</b>' + pe.map(function (p) { return p.evidence.map(function (e) { return '<div class="ev on"><b>' + esc(e.type) + ':</b> ' + esc(e.text) + '</div>'; }).join(''); }).join('') + '</div>';
      h += '<div class="sub">' + esc(t('langnote')) + '<br>' + esc(t('disclaimer')) + '</div>';
      h += '<div class="nav"><button class="btn s" id="c_new">' + esc(t('newc')) + '</button><button class="btn" id="c_print">🖨 ' + esc(t('print')) + '</button></div>';
      return h;
    }
    function pregHtml(P) {
      var sc = P.scenarios, ids = {};
      [sc.male.rows, sc.female.rows, P.noneBorn.rows].forEach(function (rs) { rs.forEach(function (r) { ids[r.id] = 1; }); });
      function f(rows, id) { var r = rows.filter(function (x) { return x.id === id; }); if (!r.length) return '—'; var s = F.zero(); r.forEach(function (x) { s = F.add(s, x.frac); }); return ftxt(s); }
      var h = '<div class="box"><b>🤰 ' + esc(t('pregT')) + '</b></div><table><tr><th>' + t('heir') + '</th><th>' + t('ifmale') + '</th><th>' + t('iffemale') + '</th><th>' + t('ifnot') + '</th><th>' + t('now') + '</th></tr>';
      Object.keys(ids).forEach(function (id) { h += '<tr><td>' + esc(nm(id)) + '</td><td dir="ltr">' + f(sc.male.rows, id) + '</td><td dir="ltr">' + f(sc.female.rows, id) + '</td><td dir="ltr">' + f(P.noneBorn.rows, id) + '</td><td dir="ltr">' + (P.immediate[id] ? ftxt(P.immediate[id]) : '—') + '</td></tr>'; });
      h += '<tr><td><b>' + esc(t('unborn')) + '</b></td><td dir="ltr">' + ftxt(sc.male.unborn) + '</td><td dir="ltr">' + ftxt(sc.female.unborn) + '</td><td>—</td><td dir="ltr">' + esc(t('reserve')) + ': ' + ftxt(P.reserve) + '</td></tr></table>';
      h += '<div class="box">' + esc(t('khuntha')) + ': <b dir="ltr">' + ftxt(P.khuntha.unborn) + '</b></div>';
      (P.notes || []).forEach(function (n) { h += '<div class="warn">' + esc(n) + '</div>'; });
      (P.evidence || []).forEach(function (p) { (p.evidence || []).forEach(function (e) { h += '<div class="ev on"><b>' + esc(e.type) + ':</b> ' + esc(e.text) + '</div>'; }); });
      return h;
    }

    function api(body) {
      var hd = { 'Content-Type': 'application/json' }; var tk = o.token && o.token(); if (tk) hd.Authorization = 'Bearer ' + tk;
      return fetch('/api/student', { method: 'POST', headers: hd, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
    }
    function readStep1() {
      var g = function (id) { var x = el.querySelector('#' + id); return x ? x.value : ''; };
      if (el.querySelector('#c_g')) { S.gender = g('c_g'); S.est.gross = g('c_gross'); S.est.funeral = g('c_fun'); S.est.debts = g('c_debt'); S.est.will = g('c_will'); S.est.willOk = el.querySelector('#c_wok').checked; }
    }
    function compute() {
      var inp = cleanInp(), est = { gross: +S.est.gross || 0, funeral: +S.est.funeral || 0, debts: +S.est.debts || 0, willAmount: +S.est.will || 0, willConsent: !!S.est.willOk };
      var opts = { barred: barredList() };
      var pred = S.pred.filter(function (p) { return (p.sons || 0) + (p.daughters || 0) > 0; }).map(function (p) { return { kind: p.kind, sons: +p.sons || 0, daughters: +p.daughters || 0, gift: +p.gift || 0 }; });
      var copts = { barred: opts.barred, predeceased: pred };
      var R = { calc: E.calculate(inp, est, copts) };
      if (S.preg) R.preg = E.solvePregnancy(inp, { barred: opts.barred, unbornKind: S.pregKind });
      S.res = R; S.ref = '';
      api({ action: 'ref_save', inp: inp, estate: est, opts: opts, source: o.source || 'calc' }).then(function (j) { if (j && j.ref) { S.ref = j.ref; var x = el.querySelector('.ref'); if (x) x.textContent = j.ref; } }).catch(function () {});
    }
    function printIt() {
      var R = S.res, c = R.calc, res = c.result, d = new Date();
      var rows = res.rows.map(function (r) { return '<tr><td>' + esc(nm(r.id)) + '</td><td>' + r.count + '</td><td dir="ltr">' + ftxt(r.frac) + '</td>' + (+c.gross ? '<td>' + money(r.frac, c.distributable) + '</td>' : '') + '</tr>'; }).join('');
      var pn = document.getElementById('hqPrint'); if (!pn) { pn = document.createElement('div'); pn.id = 'hqPrint'; document.body.appendChild(pn); }
      pn.dir = L === 'ar' ? 'rtl' : 'ltr';
      pn.innerHTML = '<div class="pg"><div class="wm"></div><div class="lh"><img src="' + LOGO + '"><div><b style="font-size:18px">' + esc(t('office')) + '</b><br>' + esc(t('city')) + '</div></div><h2>' + esc(t('title')) + '</h2><p>' + esc(t('ref')) + ': <b dir="ltr">' + esc(S.ref) + '</b> | ' + esc(t('date')) + ': ' + d.toLocaleDateString(L === 'ar' ? 'en-US' : L === 'fr' ? 'fr-FR' : 'en-GB') + '</p>' +
        (+c.gross ? '<p>' + esc(t('net')) + ': ' + fmt(c.net) + ' ' + t('cur') + ' | ' + esc(t('dist')) + ': ' + fmt(c.distributable) + '</p>' : '') +
        '<table><tr><th>' + t('heir') + '</th><th>' + t('cnt') + '</th><th>' + t('share') + '</th>' + (+c.gross ? '<th>' + t('amount') + '</th>' : '') + '</tr>' + rows + '</table>' +
        (res.blocked.length ? '<p><b>' + esc(t('blk')) + ':</b> ' + res.blocked.map(function (b) { return esc(nm(b.id)) + ' (' + esc(b.by) + ')'; }).join('، ') + '</p>' : '') +
        '<p style="font-size:11px">' + esc(t('disclaimer')) + ' ' + esc(t('wnote')) + '</p><div class="ft">' + esc(t('office')) + ' | WhatsApp / Tel 01554797398 | legalelhaqania@gmail.com</div></div>';
      setTimeout(function () { window.print(); }, 150);
    }
    function render() {
      L = lang();
      var body = S.step === 1 ? v1() : S.step === 2 ? v2() : S.step === 3 ? v3() : S.step === 4 ? v4() : v5();
      var nav = S.step < 5 ? '<div class="nav"><button class="btn l" id="c_back" style="visibility:' + (S.step > 1 ? 'visible' : 'hidden') + '">' + esc(t('back')) + '</button><button class="btn" id="c_next">' + esc(S.step === 4 ? t('calc') : t('next')) + '</button></div>' : '';
      var open = S.step === 1 ? '<div class="box"><b>' + esc(t('open')) + '</b> <input type="text" id="c_open" placeholder="' + esc(t('openPh')) + '" style="max-width:220px;display:inline-block;direction:ltr"> <button class="btn l" id="c_openb">' + esc(t('openBtn')) + '</button> <span class="err" id="c_operr"></span></div>' : '';
      el.innerHTML = '<div class="hqc" dir="' + (L === 'ar' ? 'rtl' : 'ltr') + '">' + head() + stepsBar() + body + nav + open + '</div>';
      bind();
    }
    function bind() {
      var q = function (s) { return el.querySelector(s); };
      el.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var id = b.dataset.p; S.inp[id] = Math.min(lim(id), (S.inp[id] || 0) + 1); render(); }; });
      el.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { var id = b.dataset.m; S.inp[id] = Math.max(0, (S.inp[id] || 0) - 1); render(); }; });
      el.querySelectorAll('[data-bar]').forEach(function (b) { b.onchange = function () { S.barred[b.dataset.bar] = b.checked; }; });
      el.querySelectorAll('[data-ev]').forEach(function (a) { a.onclick = function () { a.nextElementSibling.classList.toggle('on'); }; });
      var pg = q('#c_preg'); if (pg) pg.onchange = function () { S.preg = pg.checked; q('#pregBox').style.display = S.preg ? 'block' : 'none'; };
      var pk = q('#c_pk'); if (pk) pk.onchange = function () { S.pregKind = pk.value; };
      var ap = q('#c_addp'); if (ap) ap.onclick = function () { S.pred.push({ kind: 'son', sons: 0, daughters: 0, gift: 0 }); render(); };
      el.querySelectorAll('[data-pk]').forEach(function (s) { s.onchange = function () { S.pred[+s.dataset.pk].kind = s.value; }; });
      [['ps', 'sons'], ['pd', 'daughters'], ['pg', 'gift']].forEach(function (m) { el.querySelectorAll('[data-' + m[0] + ']').forEach(function (i) { i.onchange = function () { S.pred[+i.dataset[m[0]]][m[1]] = +i.value || 0; }; }); });
      var nx = q('#c_next'); if (nx) nx.onclick = function () { readStep1(); if (S.step === 4) { if (!Object.keys(cleanInp()).length) { S.step = 2; render(); return; } compute(); S.step = 5; } else S.step++; render(); window.scrollTo && el.scrollIntoView({ behavior: 'smooth' }); };
      var bk = q('#c_back'); if (bk) bk.onclick = function () { readStep1(); S.step = Math.max(1, S.step - 1); render(); };
      var nw = q('#c_new'); if (nw) nw.onclick = function () { S.inp = {}; S.barred = {}; S.pred = []; S.preg = false; S.res = null; S.step = 1; render(); };
      var pr = q('#c_print'); if (pr) pr.onclick = printIt;
      var ob = q('#c_openb'); if (ob) ob.onclick = function () { openRef(q('#c_open').value.trim()); };
    }
    function openRef(ref) {
      if (!ref) return;
      api({ action: 'ref_get', ref: ref }).then(function (j) {
        if (!j || !j.inp) { var e = el.querySelector('#c_operr'); if (e) e.textContent = t('notfound'); return; }
        S.inp = j.inp; S.barred = {}; ((j.opts && j.opts.barred) || []).forEach(function (k) { S.barred[k] = true; });
        var e = j.estate || {}; S.est = { gross: e.gross || '', funeral: e.funeral || '', debts: e.debts || '', will: e.willAmount || '', willOk: !!e.willConsent };
        S.gender = j.inp.husband ? 'female' : 'male'; S.step = 4; render();
      }).catch(function () { var e = el.querySelector('#c_operr'); if (e) e.textContent = t('notfound'); });
    }
    var qs = (location.search.match(/[?&]ref=([A-Za-z0-9-]+)/) || [])[1];
    render(); if (qs) openRef(qs);
    document.addEventListener('click', function (e) { if (e.target && e.target.classList && e.target.classList.contains('lang-btn')) setTimeout(render, 80); });
  }

  // ---- optional verse player (An-Nisa 13-14), no autoplay ----
  var V13 = 'تِلْكَ حُدُودُ ٱللَّهِ ۚ وَمَن يُطِعِ ٱللَّهَ وَرَسُولَهُۥ يُدْخِلْهُ جَنَّـٰتٍۢ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ خَـٰلِدِينَ فِيهَا ۚ وَذَٰلِكَ ٱلْفَوْزُ ٱلْعَظِيمُ';
  var V14 = 'وَمَن يَعْصِ ٱللَّهَ وَرَسُولَهُۥ وَيَتَعَدَّ حُدُودَهُۥ يُدْخِلْهُ نَارًا خَـٰلِدًۭا فِيهَا وَلَهُۥ عَذَابٌۭ مُّهِينٌ';
  var VL = { ar: ['🔊 استمع للآية', 'النساء ١٣-١٤', 'تلاوة الشيخ محمد صديق المنشاوي (مرتّل)، من موقع', 'تشغيل', 'إيقاف مؤقت', 'كتم', 'إلغاء الكتم'], en: ['🔊 Listen to the verse', 'An-Nisa 4:13-14', 'Recitation by Sheikh Muhammad Siddiq Al-Minshawi (murattal), from', 'Play', 'Pause', 'Mute', 'Unmute'], fr: ['🔊 Écouter le verset', 'An-Nisa 4:13-14', 'Récitation du Cheikh Muhammad Siddiq Al-Minshawi (murattal), depuis', 'Lire', 'Pause', 'Muet', 'Son'] };
  var VA = null;
  function vaudio() {
    if (VA) return VA;
    var a1 = new Audio('/assets/audio/nisa-4-013.mp3'), a2 = new Audio('/assets/audio/nisa-4-014.mp3');
    a1.preload = a2.preload = 'auto';
    VA = { a1: a1, a2: a2, playing: false, muted: false, done: false, cb: [] };
    function upd() { VA.cb.forEach(function (f) { f(); }); }
    a1.onended = function () { a2.play().catch(function () {}); };
    a2.onended = function () { VA.playing = false; VA.done = true; a1.currentTime = 0; a2.currentTime = 0; upd(); };
    [a1, a2].forEach(function (a) { a.onplay = function () { VA.playing = true; upd(); }; a.onpause = function () { if (!a.ended) { VA.playing = false; upd(); } }; });
    VA.toggle = function () { if (VA.playing) { a1.pause(); a2.pause(); } else { (a2.currentTime > 0 && !a2.ended ? a2 : a1).play().catch(function () {}); } };
    VA.mute = function () { VA.muted = !VA.muted; a1.muted = a2.muted = VA.muted; upd(); };
    return VA;
  }
  function verse(host, opt) {
    opt = opt || {};
    if (!document.getElementById('hqAmiri')) { var fl = document.createElement('link'); fl.id = 'hqAmiri'; fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap'; document.head.appendChild(fl); }
    var l = lang(), x = VL[l] || VL.ar, A = vaudio();
    if (host) host.innerHTML = '<div style="max-width:960px;margin:0 auto 14px;background:#111;color:#e8c872;border-radius:12px;padding:14px 18px;text-align:center;font-family:Cairo,sans-serif"><button id="hqVerseBtn" style="background:#b59461;color:#fff;border:0;border-radius:22px;padding:9px 24px;font:inherit;font-weight:700;cursor:pointer">' + x[0] + '</button><div id="hqVerseTx" dir="rtl" style="margin-top:12px;font-size:1.35rem;line-height:2.2;font-family:\'Amiri Quran\',\'Amiri\',\'Scheherazade New\',\'Traditional Arabic\',serif;text-align:center;text-align-last:center;word-spacing:normal">' + V13 + ' ﴿١٣﴾<br>' + V14 + ' ﴿١٤﴾<div style="font-size:.8rem;color:#bbb;font-family:Cairo,sans-serif">' + x[1] + '</div></div><div style="font-size:.75rem;color:#999;margin-top:6px">' + x[2] + ' <a href="https://everyayah.com" target="_blank" rel="noopener" style="color:#b59461">EveryAyah.com</a></div></div>';
    var ctl = document.getElementById('hqVerseCtl');
    if (!ctl) {
      ctl = document.createElement('div'); ctl.id = 'hqVerseCtl';
      ctl.style.cssText = 'position:fixed;bottom:16px;left:84px;z-index:9998;background:#111;border:1px solid #b59461;border-radius:24px;padding:4px 8px;display:flex;gap:6px;font-family:Cairo,sans-serif';
      ctl.innerHTML = '<button data-a="t" style="background:#b59461;color:#fff;border:0;border-radius:18px;min-width:34px;height:32px;cursor:pointer;font-size:1rem"></button><button data-a="m" style="background:#333;color:#fff;border:0;border-radius:18px;min-width:34px;height:32px;cursor:pointer;font-size:1rem"></button>';
      document.body.appendChild(ctl);
      ctl.querySelector('[data-a=t]').onclick = function () { A.toggle(); };
      ctl.querySelector('[data-a=m]').onclick = function () { A.mute(); };
    }
    function ui() { var xx = VL[lang()] || VL.ar; ctl.querySelector('[data-a=t]').textContent = A.playing ? '⏸' : '▶'; ctl.querySelector('[data-a=t]').title = A.playing ? xx[4] : xx[3]; ctl.querySelector('[data-a=m]').textContent = A.muted ? '🔇' : '🔊'; ctl.querySelector('[data-a=m]').title = A.muted ? xx[6] : xx[5]; }
    A.cb = [ui]; ui();
    var b = host && host.querySelector('#hqVerseBtn'); if (b) b.onclick = function () { A.toggle(); };
    if (opt.auto && !A.tried) {
      A.tried = true; var seen = false; try { seen = sessionStorage.getItem('hq_verse_done') === '1'; } catch (e) {}
      if (!seen) {
        try { sessionStorage.setItem('hq_verse_done', '1'); } catch (e) {}
        var go = function () { A.a1.play().then(function () { window.HQVerseState = 'autoplay'; }).catch(function () {
          window.HQVerseState = 'blocked-waiting-click';
          var once = function () { ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.removeEventListener(ev, once, true); }); if (!A.playing && !A.done) { A.a1.play().then(function () { window.HQVerseState = 'played-on-first-click'; }).catch(function () {}); } };
          ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, once, true); });
        }); };
        go();
      }
    }
  }
  window.HQCalcT = { T: T, EN: EN, FR: FR };
  window.HQVerse = verse;
  window.HQCalc = { mount: mount };
})();
