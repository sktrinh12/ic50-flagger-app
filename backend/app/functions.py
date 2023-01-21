from scipy import stats
from numpy import std


def get_msr_stats(results, n_limit):
    """
    results is a json object containing cmpd_id, date, row_cnt, diff_ic50, avg_ic50
    """
    if not results:
        return
    diff_ic50 = []
    avg_ic50 = []
    # calculate MSR manually instead of on SQL side
    for jd in results:
        diff_ic50.append(jd["DIFF_IC50"])
        avg_ic50.append(jd["AVG_IC50"])
    stdev = std(diff_ic50)
    msr = 10 ** (2 * stdev)
    count = len(diff_ic50)
    se = stdev / count**0.5
    # calc min
    min_diff = min(diff_ic50)
    # calc max
    max_diff = max(diff_ic50)
    # calc avgs
    avg_diff = sum(diff_ic50) / count
    mr_diff = 10**avg_diff
    # equivalent to Excel TINV(0.05,999)
    t_stat = stats.t.ppf(1 - 0.05, count - 1)
    rl_plus = 10 ** (avg_diff + t_stat * se)
    rl_minus = 10 ** (avg_diff - t_stat * se)
    lsa_plus = 10 ** (avg_diff + 2 * stdev)
    lsa_minus = 10 ** (avg_diff - 2 * stdev)
    calc_stats = {
        "MSR": msr if count == n_limit else "NULL",
        "STDEV": stdev,
        "STDERR": se,
        "N": count,
        "RL": [rl_minus, rl_plus],
        "LSA": [lsa_minus, lsa_plus],
        "MR": mr_diff,
        "MIN": min_diff,
        "MAX": max_diff,
    }
    return calc_stats
