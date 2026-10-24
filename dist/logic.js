(function (root) {
  const MS_PER_DAY = 86400000;

  function dateOnly(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function businessDaysInclusive(start, end) {
    let count = 0;
    for (let cursor = dateOnly(start); cursor <= dateOnly(end); cursor = new Date(cursor.getTime() + MS_PER_DAY)) {
      const day = cursor.getUTCDay();
      if (day !== 0 && day !== 6) count += 1;
    }
    return count;
  }

  function isAvailabilityCurrent(lastConfirmed, requestStart) {
    if (!lastConfirmed) return false;
    const age = Math.floor((dateOnly(requestStart) - dateOnly(lastConfirmed)) / MS_PER_DAY);
    return age >= 0 && age <= 14;
  }

  function checkAvailability(members, request) {
    const workdays = businessDaysInclusive(request.startDate, request.deadline);
    return members.map((member) => {
      const skills = member.skills.split(",").map((skill) => skill.trim().toLowerCase());
      const requiredSkill = request.requiredSkill.trim().toLowerCase();
      const hasSkill = skills.includes(requiredSkill);
      const confirmed = isAvailabilityCurrent(member.lastConfirmed, request.startDate);
      const commitmentsConfirmed = request.committedHoursConfirmed !== false;
      const totalPeriodCapacity = member.dailyCapacity * workdays;
      // Committed work is unfinished work due within this request window.
      // It is intentionally the only workload value subtracted from capacity.
      const committedTaskHours = Math.max(0, Number(member.committedHours) || 0);
      const netCapacity = Math.max(0, totalPeriodCapacity - committedTaskHours);
      const confirmedCapacity = confirmed && commitmentsConfirmed ? netCapacity : 0;
      const sufficientCapacity = netCapacity >= request.estimatedHours;
      const status = !hasSkill ? "skill-mismatch" : !commitmentsConfirmed ? "needs-commitment-review" : !confirmed ? "needs-confirmation" : !sufficientCapacity ? "insufficient-capacity" : "qualified";
      return { ...member, workdays, hasSkill, confirmed, commitmentsConfirmed, totalPeriodCapacity, committedTaskHours, netCapacity, confirmedCapacity, sufficientCapacity, status };
    });
  }

  const api = { businessDaysInclusive, isAvailabilityCurrent, checkAvailability };
  if (typeof module !== "undefined") module.exports = api;
  root.TeamFitLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
