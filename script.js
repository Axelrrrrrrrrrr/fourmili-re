/* =====================================================
   LA FOURMILIÈRE — script.js
   Fonctionne pour index.html ET page2.html
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Header scroll ---- */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ---- Menu hamburger mobile ---- */
  const hamburger = document.querySelector('.hamburger');
  const menuMobile = document.querySelector('.menu-mobile');
  if (hamburger && menuMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      menuMobile.classList.toggle('open');
    });
    menuMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        menuMobile.classList.remove('open');
      });
    });
  }

  /* ---- Animations scroll (Intersection Observer) ---- */
  const animEls = document.querySelectorAll('.apparait, .apparait-gauche, .apparait-droite');
  if (animEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    animEls.forEach(el => obs.observe(el));
  }

  /* ---- Filtres espaces (index.html) ---- */
  const filtreBtns = document.querySelectorAll('.filtre-btn');
  const cartesEspace = document.querySelectorAll('.carte-espace');
  if (filtreBtns.length) {
    filtreBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filtreBtns.forEach(b => b.classList.remove('actif'));
        btn.classList.add('actif');
        const filtre = btn.dataset.filtre;
        cartesEspace.forEach(carte => {
          const visible = filtre === 'tous' || carte.dataset.type === filtre;
          carte.style.transition = 'opacity .3s ease';
          if (visible) {
            carte.style.display = '';
            setTimeout(() => carte.style.opacity = 1, 10);
          } else {
            carte.style.opacity = 0;
            setTimeout(() => carte.style.display = 'none', 300);
          }
        });
      });
    });
  }

  /* ---- Animation compteurs (index.html) ---- */
  const compteurs = document.querySelectorAll('[data-compteur]');
  if (compteurs.length) {
    const obsCompt = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const fin = parseInt(el.dataset.compteur);
          const suffixe = el.dataset.suffixe || '';
          let curr = 0;
          const pas = fin / (1800 / 16);
          const timer = setInterval(() => {
            curr = Math.min(curr + pas, fin);
            el.textContent = Math.round(curr) + suffixe;
            if (curr >= fin) clearInterval(timer);
          }, 16);
          obsCompt.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    compteurs.forEach(el => obsCompt.observe(el));
  }

  /* ---- Formulaire contact (index.html) ---- */
  const formContact = document.getElementById('formContact');
  if (formContact) {
    formContact.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formContact.querySelector('button[type=submit]');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;
      await new Promise(r => setTimeout(r, 1500));
      formContact.style.display = 'none';
      document.querySelector('.form-succes').style.display = 'block';
    });
  }

  /* ---- Smooth scroll ancres ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const cible = document.querySelector(a.getAttribute('href'));
      if (cible) { e.preventDefault(); cible.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ==================================================
     PAGE 2 — RÉSERVATION (ne s'exécute que si présent)
  ================================================== */

  /* ---- Navigation multi-étapes ---- */
  const etapes = document.querySelectorAll('.etape');
  const panneaux = document.querySelectorAll('.panneau');
  let etapeActuelle = 0;

  function allerEtape(n) {
    etapes.forEach((e, i) => {
      e.classList.toggle('active', i === n);
      e.classList.toggle('faite', i < n);
    });
    panneaux.forEach((p, i) => p.classList.toggle('actif', i === n));
    etapeActuelle = n;
    mettreAJourRecap();
  }

  document.querySelectorAll('[data-suivant]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validerEtape(etapeActuelle)) allerEtape(etapeActuelle + 1);
    });
  });
  document.querySelectorAll('[data-precedent]').forEach(btn => {
    btn.addEventListener('click', () => allerEtape(etapeActuelle - 1));
  });

  /* ---- Boutons durée ---- */
  const dureeBtns = document.querySelectorAll('.duree-btn');
  dureeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dureeBtns.forEach(b => b.classList.remove('selectionne'));
      btn.classList.add('selectionne');
      mettreAJourRecap();
    });
  });

  /* ---- Compteur personnes ---- */
  let nbPersonnes = 4;
  const nbEl = document.getElementById('nbPersonnes');
  document.getElementById('moinsPersonnes')?.addEventListener('click', () => {
    if (nbPersonnes > 1) { nbPersonnes--; if (nbEl) nbEl.textContent = nbPersonnes; mettreAJourRecap(); }
  });
  document.getElementById('plusPersonnes')?.addEventListener('click', () => {
    if (nbPersonnes < 10) { nbPersonnes++; if (nbEl) nbEl.textContent = nbPersonnes; mettreAJourRecap(); }
  });

  /* ---- Extras ---- */
  document.querySelectorAll('.extra input').forEach(cb => cb.addEventListener('change', mettreAJourRecap));

  /* ---- Date min = aujourd'hui ---- */
  const dateInput = document.getElementById('resaDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
    dateInput.value = dateInput.min;
  }

  /* ---- Calcul durée ---- */
  function calcDuree() {
    const sel = document.querySelector('.duree-btn.selectionne');
    if (sel && parseFloat(sel.dataset.heures) > 0) return parseFloat(sel.dataset.heures);
    const debut = document.getElementById('resaDebut')?.value;
    const fin   = document.getElementById('resaFin')?.value;
    if (debut && fin) {
      const [dh, dm] = debut.split(':').map(Number);
      const [fh, fm] = fin.split(':').map(Number);
      const diff = (fh * 60 + fm) - (dh * 60 + dm);
      return diff > 0 ? diff / 60 : 0;
    }
    return 0;
  }

  /* ---- Mise à jour récap ---- */
  const EXTRAS_PRIX = { cafe: 10, parking: 0, visio: 15, repas: 18 };
  const EXTRAS_NOMS = { cafe: 'Café & boissons', parking: 'Parking visiteurs', visio: 'Kit visioconférence', repas: 'Plateau repas' };

  function mettreAJourRecap() {
    const date   = document.getElementById('resaDate')?.value;
    const debut  = document.getElementById('resaDebut')?.value || '—';
    const heures = calcDuree();
    const base   = heures * 25;

    let totalExtras = 0, htmlExtras = '';
    document.querySelectorAll('.extra input:checked').forEach(cb => {
      const p = EXTRAS_PRIX[cb.value] || 0;
      const n = EXTRAS_NOMS[cb.value] || cb.value;
      totalExtras += p;
      htmlExtras += `<div class="recap-ligne"><span class="etiq">${n}</span><span class="val">${p === 0 ? 'Inclus' : p + '€'}</span></div>`;
    });

    const total = base + totalExtras;
    const dateAff = date ? new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'long' }) : '—';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    set('recapDate',     dateAff);
    set('recapDuree',    heures > 0 ? `${heures}h · dès ${debut}` : '—');
    set('recapPersonnes', `${nbPersonnes} pers.`);
    set('recapExtras',   htmlExtras || '<div class="recap-ligne"><span class="etiq">Aucun supplément</span></div>');
    set('recapTotal',    total > 0 ? total + '€ <small>HT</small>' : '—');
  }

  /* ---- Validation étape ---- */
  function validerEtape(n) {
    if (n === 0) {
      const date = document.getElementById('resaDate')?.value;
      if (!date) { alert('Veuillez choisir une date.'); return false; }
      if (calcDuree() <= 0) { alert('Veuillez sélectionner une durée.'); return false; }
    }
    if (n === 1) {
      const prenom = document.getElementById('resaPrenom')?.value;
      const email  = document.getElementById('resaEmail')?.value;
      if (!prenom || !email) { alert('Merci de renseigner prénom et e-mail.'); return false; }
    }
    return true;
  }

  /* ---- Confirmation finale ---- */
  const btnConfirmer = document.getElementById('btnConfirmer');
  if (btnConfirmer) {
    btnConfirmer.addEventListener('click', async () => {
      if (!validerEtape(1)) return;
      btnConfirmer.textContent = 'Confirmation…';
      btnConfirmer.disabled = true;
      await new Promise(r => setTimeout(r, 1600));
      document.querySelector('.resa-form-box').style.display = 'none';
      document.getElementById('confirmation').style.display = 'block';
    });
  }

  /* ---- Màj étape 3 recap ---- */
  document.querySelectorAll('[data-suivant]').forEach(btn => {
    btn.addEventListener('click', () => {
      const set2 = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      const date = document.getElementById('resaDate')?.value;
      set2('confirmDate',     date ? new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—');
      set2('confirmDuree',    document.getElementById('recapDuree')?.textContent || '—');
      set2('confirmPersonnes', nbPersonnes + ' participant(s)');
      set2('confirmEmail',    document.getElementById('resaEmail')?.value || '—');
    });
  });

  /* ---- Init page 2 ---- */
  if (etapes.length) {
    allerEtape(0);
    mettreAJourRecap();
    ['resaDate','resaDebut','resaFin'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', mettreAJourRecap);
    });
  }

  /* ---- Année footer ---- */
  document.querySelectorAll('.annee').forEach(el => el.textContent = new Date().getFullYear());

});
