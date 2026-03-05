// FlipLink BET2 – preview.js
// Handles interactivity on the profile preview page.

(function () {
  'use strict';

  /* ── Toast helper ───────────────────────────────────── */
  let toastTimer;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ── Share profile ───────────────────────────────────── */
  async function handleShare() {
    const url = window.location.href;
    const name = document.querySelector('.profile-name')?.textContent?.trim() ?? 'Profile';
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} on FlipLink`, url });
      } catch (_) { /* user cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('🔗 Profile link copied!');
    } else {
      showToast('🔗 ' + url);
    }
  }

  /* ── Init ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Attach play-button handlers (delegated from the link-play spans)
    document.querySelectorAll('.link-item').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        const title = btn.querySelector('.link-title')?.textContent ?? 'video';
        // If the play icon was specifically clicked, show "Playing" wording
        const playLabel = e.target.closest('[aria-label]')?.getAttribute('aria-label');
        if (playLabel) {
          showToast(`▶ Playing: ${title}`);
        } else {
          showToast(`Opening: ${title}`);
        }
      });
    });

    // Share button
    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) shareBtn.addEventListener('click', handleShare);

    // Edit button
    const editBtn = document.getElementById('btn-edit');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        showToast('✏️ Edit mode coming soon!');
      });
    }
  });
})();
