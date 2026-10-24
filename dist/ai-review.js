(function (root) {
  function createReviewState() {
    let source = '';
    let approved = false;
    return {
      setDraft(text) { source = text; approved = false; },
      sourceChanged(text) { if (text !== source) approved = false; return approved; },
      approve(text) { if (text !== source) return false; approved = true; return true; },
      isApproved(text) { return approved && text === source; }
    };
  }
  function copySelectedFacts({ draft, selectedFacts, existingDescription, allowReplace, approved }) {
    const originalDescription = String(existingDescription || '');
    if (!approved) return { changed: false, description: originalDescription, deadline: null, message: 'Copy blocked: check “I reviewed this draft” before copying selected facts.' };

    const selected = Array.isArray(selectedFacts) ? selectedFacts : [];
    const normalise = (value) => String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
    const selectedQuantities = selected
      .filter((item) => item.kind === 'quantities')
      .map((item) => draft.quantities?.[Number(item.index)])
      .filter((item) => item && item.supported !== false && item.quantity && item.deliverable);
    const deliverables = selected
      .filter((item) => item.kind === 'deliverables')
      .map((item) => draft.deliverables?.[Number(item.index)])
      .filter((item) => item && item.supported !== false && item.text)
      .map((item) => {
        const deliverableName = normalise(item.text);
        const linkedQuantities = [...new Map(selectedQuantities
          .filter((quantity) => normalise(quantity.deliverable) === deliverableName)
          .map((quantity) => [normalise(quantity.quantity), quantity.quantity.trim()]))
          .values()];
        if (!linkedQuantities.length) return item.text;
        return linkedQuantities.map((quantity) => normalise(quantity).includes(deliverableName) ? quantity : `${quantity} ${item.text}`);
      })
      .flat();

    if (deliverables.length && originalDescription.trim() && !allowReplace) {
      return { changed: false, description: originalDescription, deadline: null, message: 'Copy blocked: select “Replace the current task description” to overwrite the existing description.' };
    }

    const exactDeadline = selected
      .filter((item) => item.kind === 'deadlines')
      .map((item) => draft.deadlines?.[Number(item.index)])
      .find((item) => item && item.supported !== false && !item.needs_clarification && /^\d{4}-\d{2}-\d{2}$/.test(item.text));
    const description = deliverables.length ? deliverables.join('\n') : originalDescription;
    const changed = description !== originalDescription || Boolean(exactDeadline);

    if (!changed) return { changed: false, description: originalDescription, deadline: null, message: 'Copy blocked: select at least one supported deliverable or an exact supported deadline.' };
    return { changed: true, description, deadline: exactDeadline ? exactDeadline.text : null, message: 'Selected supported facts copied. Review the manual form before checking capacity; estimates and required skill were not changed.' };
  }

  const api = { createReviewState, copySelectedFacts };
  if (typeof module !== 'undefined') module.exports = api;
  root.TeamFitReview = api;
})(typeof window !== 'undefined' ? window : globalThis);
