# field names and snippets of sql text for backend calls
import re

field_names_dct = {
    "cellular_stats_fields": [
        "COMPOUND_ID",
        "CRO",
        "ASSAY_TYPE",
        "CELL_LINE",
        "VARIANT",
        "CELL_INCUBATION_HR",
        "PCT_SERUM",
        "THREED",
        "GEOMEAN",
        "N_OF_M",
        "STDEV",
    ],
    "cellular_all_fields": [
        "PID",
        "CREATED_DATE",
        "CRO",
        "ASSAY_TYPE",
        "COMPOUND_ID",
        "EXPERIMENT_ID",
        "BATCH_ID",
        "CELL_LINE",
        "VARIANT",
        "PCT_SERUM",
        "THREED",
        "TREATMENT",
        "PASSAGE_NUMBER",
        "WASHOUT",
        "CELL_INCUBATION_HR",
        "PLOT",
        "IC50_NM",
        "FLAG",
        "COMMENT_TEXT",
        "USER_NAME",
        "CHANGE_DATE",
        "GEOMEAN",
    ],
    "msr_data_fields": [
        "COMPOUND_ID",
        "CREATED_DATE",
        "ROW_COUNT",
        "IC50_NM_1",
        "IC50_NM_2",
        "DIFF_IC50",
        "AVG_IC50",
    ],
    "biochem_stats_fields": [
        "COMPOUND_ID",
        "CRO",
        "ASSAY_TYPE",
        "TARGET",
        "VARIANT",
        "COFACTORS",
        "ATP_CONC_UM",
        "GEOMEAN",
        "N_OF_M",
        "STDEV",
    ],
    "biochem_all_fields": [
        "PID",
        "CREATED_DATE",
        "CRO",
        "ASSAY_TYPE",
        "COMPOUND_ID",
        "EXPERIMENT_ID",
        "BATCH_ID",
        "TARGET",
        "VARIANT",
        "COFACTORS",
        "ATP_CONC_UM",
        "PLOT",
        "IC50_NM",
        "FLAG",
        "COMMENT_TEXT",
        "USER_NAME",
        "CHANGE_DATE",
        "GEOMEAN",
    ],
}

sql_cmds = {
    "GEOMEAN_CELL_STATS": None,
    "GEOMEAN_CELL_ALL": """
    SELECT
        t3.PID,
        t3.CREATED_DATE,
        t3.CRO,
        t3.ASSAY_TYPE,
        t3.COMPOUND_ID,
        t3.EXPERIMENT_ID,
        t3.BATCH_ID,
        t3.CELL_LINE,
        t3.VARIANT,
        t3.PCT_SERUM,
        case t3.THREED when 'Y' then '3D' else '-' end THREED,
        case when t3.TREATMENT is not null then treatment else '-' end TREATMENT,
        t3.PASSAGE_NUMBER,
        t3.WASHOUT,
        t3.CELL_INCUBATION_HR,
        BASE64ENCODE(t3.GRAPH) as GRAPH,
        ROUND(t3.ic50_nm,2) as IC50_NM,
        t3.FLAG,
        t3.COMMENT_TEXT,
        t3.USER_NAME,
        t3.CHANGE_DATE,
    ROUND( POWER(10,
       AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
        t3.CRO,
        t3.ASSAY_TYPE,
        t3.COMPOUND_ID,
        t3.CELL_LINE,
        t3.VARIANT,
        t3.PCT_SERUM,
        t3.CELL_INCUBATION_HR,
        t3.FLAG
    )) * TO_NUMBER('1.0e+09'), 2) AS GEOMEAN
    FROM (
      SELECT t1.CRO,
         t1.ASSAY_TYPE,
         t1.experiment_id,
         t1.COMPOUND_ID,
         t1.BATCH_ID,
         t1.CELL_LINE,
         t1.VARIANT,
         t1.CREATED_DATE,
         t1.PCT_SERUM,
         t1.WASHOUT,
         t1.PASSAGE_NUMBER,
         t1.THREED,
         t1.TREATMENT,
         t1.CELL_INCUBATION_HR,
         t1.GRAPH,
         nvl2(t2.FLAG, t2.FLAG, 0) flag,
         t1.ic50,
         t1.PID,
         t1.ic50_nm,
         nvl2(t2.COMMENT_TEXT, t2.COMMENT_TEXT, 'ENTER COMMENT') COMMENT_TEXT,
         nvl2(t2.USER_NAME, t2.USER_NAME, 'TESTADMIN') USER_NAME,
         nvl2(t2.CHANGE_DATE,t2.CHANGE_DATE, SYSDATE) CHANGE_DATE
    FROM DS3_USERDATA.SU_CELLULAR_GROWTH_DRC t1
    LEFT OUTER JOIN DS3_USERDATA.CELLULAR_IC50_FLAGS t2
    ON t1.pid = t2.pid) t3
    """,
    "MSR_DATA": """
        select COMPOUND_ID, CREATED_DATE, ROW_COUNT, IC50_NM_1, IC50_NM_2, DIFF_IC50, AVG_IC50
        FROM (
            GET_MSR_DATA2('{cro}', '{assay_type}', '{param1}', '{param2}', '{param3}', '{variant}', '{dsname}', {n_limit}) 
        )
        """,
    "GEOMEAN_BIO_STATS": None,
    "GEOMEAN_BIO_ALL": """SELECT
                t3.PID,
                t3.CREATED_DATE,
                t3.CRO,
                t3.ASSAY_TYPE,
                t3.COMPOUND_ID,
                t3.EXPERIMENT_ID,
                t3.BATCH_ID,
                t3.TARGET,
                t3.VARIANT,
                t3.COFACTORS,
                t3.ATP_CONC_UM,
                BASE64ENCODE(t3.GRAPH) as GRAPH,
                ROUND(t3.ic50_nm,2) as IC50_NM,
                t3.flag,
                t3.COMMENT_TEXT,
                t3.USER_NAME,
                t3.CHANGE_DATE,
             ROUND( POWER(10,
               AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
                    t3.CRO,
                    t3.ASSAY_TYPE,
                    t3.COMPOUND_ID,
                    t3.TARGET,
                    t3.VARIANT,
                    t3.COFACTORS,
                    t3.ATP_CONC_UM,
                    t3.flag
                )) * TO_NUMBER('1.0e+09'), 1) AS GEOMEAN
                FROM (
              SELECT t1.CRO,
                     t1.ASSAY_TYPE,
                     t1.experiment_id,
                     t1.COMPOUND_ID,
                     t1.BATCH_ID,
                     t1.TARGET,
                     t1.VARIANT,
                     t1.CREATED_DATE,
                     t1.COFACTORS,
                     t1.ATP_CONC_UM,
                     t1.MODIFIER,
                     t1.GRAPH,
                     nvl2(t2.flag, t2.flag, 0) flag,
                     t1.ic50,
                     t1.ic50_nm,
                     nvl2(t2.COMMENT_TEXT, t2.COMMENT_TEXT, 'ENTER COMMENT') COMMENT_TEXT,
                     nvl2(t2.USER_NAME, t2.USER_NAME, 'TESTADMIN') USER_NAME,
                     nvl2(t2.CHANGE_DATE, t2.CHANGE_DATE, SYSDATE) CHANGE_DATE,
                     t1.PID
               FROM DS3_USERDATA.SU_BIOCHEM_DRC t1
               LEFT OUTER JOIN DS3_USERDATA.BIOCHEM_IC50_FLAGS t2
               ON t1.pid = t2.pid) t3
            """,
}


def gen_multi_cmpId_sql_template_cell(mdict):
    # print(mdict)
    cmp_ids = mdict["COMPOUND_ID"].split(",")
    num_items = len(cmp_ids)
    cte_template = """SELECT {cmpid_gmean_select},
        {tbl_1}.CRO,
        {tbl_1}.ASSAY_TYPE,
        {tbl_1}.CELL,
        {tbl_1}.VARIANT,
        {tbl_1}.INC_HR,
        {tbl_1}.PCT_SERUM
          FROM {tbl_1}
          LEFT OUTER JOIN {tbl_0}
          ON {tbl_1}.CRO = {tbl_0}.CRO
        AND {tbl_1}.CELL = {tbl_0}.CELL
        AND {tbl_1}.VARIANT = {tbl_0}.VARIANT
        AND {tbl_1}.ASSAY_TYPE = {tbl_0}.ASSAY_TYPE
        AND {tbl_1}.INC_HR = {tbl_0}.INC_HR
        AND {tbl_1}.PCT_SERUM = {tbl_0}.PCT_SERUM
        """

    join_clause = ""
    cte_clause = ""
    cte_select_stmt = ""
    cnt = 0

    select_clause_lst = []
    select_clause_enum_lst = []

    # create individual with cte tables for each compound id
    for i, cmp_id in enumerate(cmp_ids):
        if i < num_items:
            join_clause += f"""
                {f', t{i+1} AS ' if i>0 else f' t{i+1} AS' } (
                SELECT DISTINCT COMPOUND_ID, GEO_NM, CRO, ASSAY_TYPE, CELL, VARIANT, INC_HR, PCT_SERUM
                FROM SU_CELLULAR_DRC_STATS
                WHERE COMPOUND_ID = '{cmp_id}'
                AND CRO = '{ mdict["CRO"] }'
                AND ASSAY_TYPE = '{ mdict["ASSAY_TYPE"] }'
                AND INC_HR = { mdict["CELL_INCUBATION_HR"] }
                {'AND PCT_SERUM = ' + str(mdict["PCT_SERUM"]) if mdict["PCT_SERUM"] is not None else ''}
                )
                """
        # select column names w/o alias
        select_clause_lst.append(
            f"{{tbl_prefix}}{i+1}.COMPOUND_ID COMPOUND_ID_{i+1}, {{tbl_prefix}}{i+1}.GEO_NM GEO_NM_{i+1}"
        )
        # select column names /w alias
        select_clause_enum_lst.append(
            f"{{tbl_prefix}}{{nbr}}.COMPOUND_ID_{i+1}, {{tbl_prefix}}{{nbr}}.GEO_NM_{i+1}"
        )

    # equivalent to ceil() without math library, add +1 since starting at 1
    cte_loop_count = -int(-(num_items / 2) // 1) + 1

    if num_items < 4:
        cte_loop_count -= 1
    else:
        cte_loop_count += 1

    # create cte inner subqueries
    for i in range(1, cte_loop_count):
        cnt = i
        if i > 1:
            select_clause_tmp_lst = select_clause_enum_lst[: i + 1]
            select_clause_edit_lst = list(
                map(
                    lambda x: x.format(tbl_prefix="cte_", nbr=i - 1),
                    select_clause_tmp_lst[:i],
                )
            )
        else:
            select_clause_tmp_lst = select_clause_lst[: i + 1]
            select_clause_edit_lst = list(
                map(lambda x: x.format(tbl_prefix="t"), select_clause_tmp_lst[:i])
            )
        # append last one which should be a `t` prefixed table to list
        select_clause_edit_lst += list(
            map(
                lambda x: x.format(tbl_prefix="t", nbr=i + 1), select_clause_tmp_lst[i:]
            )
        )
        # alias the last compound_id and geo_nm columns
        if i > 1:
            last_elem = select_clause_edit_lst[-1]
            cmp_el, gm_el = last_elem.split(",")
            new_cmp_el = cmp_el[:-2]
            new_cmp_el += f" COMPOUND_ID_{i+1}"
            new_gm_el = gm_el[:-2]
            new_gm_el += f" GEO_NM_{i+1}"
            new_last_elem = f"{new_cmp_el}, {new_gm_el}"
            select_clause_edit_lst[-1] = new_last_elem
            # print(new_last_elem)
        cte_select_stmt = ", ".join(select_clause_edit_lst)
        cte_clause += f""", cte_{i} as (
        {cte_template.format(tbl_1=f"{'cte_' if i > 1 else 't'}{i-1 if i > 1 else i}",
                             tbl_0=f"t{i+1}",
                             cmpid_gmean_select=cte_select_stmt)
        })
        """

    select_clause_lst = []
    for i in range(1, num_items + 1):
        select_clause = ""
        if i < num_items and num_items > 2:
            tbl_p = f"cte_{cnt}"
        else:
            tbl_p = f"t{i}"

        select_clause += (
            f" {tbl_p}.COMPOUND_ID{f'_{i}' if i < num_items and num_items>2 else ''}"
        )
        select_clause += (
            f", {tbl_p}.GEO_NM{f'_{i}' if i < num_items and num_items>2 else ''}"
        )
        select_clause_lst.append(select_clause)

    # edit aliases for last select clause
    select_clause_lst[-1] = re.sub(
        r"(COMPOUND_ID)", r"\1 \1_" + str(num_items), select_clause_lst[-1]
    )
    select_clause_lst[-1] = re.sub(
        r"(GEO_NM)", r"\1 \1_" + str(num_items), select_clause_lst[-1]
    )
    select_clause = ", ".join(select_clause_lst)

    if num_items < 3:
        cnt += 1

    end_clause = f""", cte_nested AS (
         {cte_template.format(tbl_1=f"{f'cte_{cnt}' if num_items>2 else f't{cnt}'}",
                             tbl_0=f"t{num_items}",
                             cmpid_gmean_select=select_clause)}
        )
        """

    # main sql statement that concats all together
    sql_statement = f"""WITH {join_clause}
            {cte_clause}
            {end_clause if num_items > 1 else ''}
            SELECT * FROM {'cte_nested' if num_items > 1 else 't1'} ORDER BY CELL
            """

    # print(sql_statement)
    return sql_statement
