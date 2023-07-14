from scipy import stats
from numpy import std
from .datasource_sql import get_ds_sql
from .sql import sql_cmds


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


def update_sql_ds():
    dct_names = {
        "GEOMEAN_CELL_STATS": {"ds_alias": "cellular", "id": 860},
        "GEOMEAN_BIO_STATS": {"ds_alias": "biochemical", "id": 912},
    }
    for key, dct in dct_names.items():
        payload = {dct["ds_alias"]: {"id": dct["id"], "app_type": "geomean_flagger"}}
        sql = get_ds_sql(payload)
        sql_query = sql["0"]["formatted_query"]
        sql_cmds[key] = sql_query
        dct_names[key]["sql_query"] = sql_query

    return dct_names
