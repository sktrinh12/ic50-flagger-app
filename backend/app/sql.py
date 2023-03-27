# field names and snippets of sql text for backend calls

field_names_dct = {
    "cellular_stats_fields": [
        "COMPOUND_ID",
        "CRO",
        "ASSAY_TYPE",
        "CELL_LINE",
        "VARIANT",
        "CELL_INCUBATION_HR",
        "PCT_SERUM",
        "MINUS_3STDEV",
        "PLUS_3STDEV",
        "MINUS_3VAR",
        "PLUS_3VAR",
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
        "MINUS_3STDEV",
        "PLUS_3STDEV",
        "MINUS_3VAR",
        "PLUS_3VAR",
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
    "GEOMEAN_CELL_STATS": """
    SELECT
        max(t0.compound_id) AS COMPOUND_ID,
        max(t0.cro) AS CRO,
        max(t0.assay_type) AS ASSAY_TYPE,
        max(t0.cell_line) AS CELL_LINE,
        max(t0.variant) AS VARIANT,
        max(t0.cell_incubation_hr) AS CELL_INCUBATION_HR,
        max(t0.pct_serum) AS PCT_SERUM,
        max(t0.threed) AS THREED,
        max(t0.geomean_nM) AS GEOMEAN,
        max(t0.nm_minus_3_stdev) AS MINUS_3STDEV,
        max(t0.nm_plus_3_stdev) AS PLUS_3STDEV,
        max(t0.nm_minus_3_var) AS MINUS_3VAR,
        max(t0.nm_plus_3_var) AS PLUS_3VAR,
        max(t0.n) || ' of ' || max(t0.m) AS N_OF_M,
        max(t0.stdev) as STDEV
    FROM (
        SELECT
            t1.cro,
            t1.assay_type,
            t1.compound_id,
            t1.batch_id,
            t1.cell_line,
            nvl(t1.variant, '-') AS variant,
            t1.cell_incubation_hr,
            t1.pct_serum,
            t1.modifier,
            t1.threed,
            t1.treatment,
            t2.flag,
        round(stddev(t1.ic50) OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.cell_line,
            t1.variant,
            t1.cell_incubation_hr,
            t1.pct_serum,
            t1.threed,
            t1.treatment,
            t1.modifier,
            t2.flag) * 1000000000, 2) AS stdev,
        round((to_char(power(10, avg(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
                t1.cro,
                t1.assay_type,
                t1.cell_line,
                t1.variant,
                t1.cell_incubation_hr,
                t1.pct_serum,
                t1.threed,
                t1.treatment,
                t1.modifier,
                t2.flag)), '99999.99EEEE') * 1000000000), 1) AS geomean_nM,
        round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
                t1.cro,
                t1.assay_type,
                t1.cell_line,
                t1.variant,
                t1.cell_incubation_hr,
                t1.pct_serum,
                t1.threed,
                t1.treatment,
                t1.modifier,
                t2.flag))* 1000000000
                - (3 * STDDEV(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                    t1.cro,
                    t1.assay_type,
                    t1.cell_line,
                    t1.variant,
                    t1.cell_incubation_hr,
                    t1.pct_serum,
                    t1.threed,
                    t1.treatment,
                    t1.modifier,
                    t2.flag) * 1000000000)), 3) AS nm_minus_3_stdev,
        round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
            t1.cro,
                t1.assay_type,
                t1.cell_line,
                t1.variant,
                t1.cell_incubation_hr,
                t1.pct_serum,
                t1.threed,
                t1.treatment,
                t1.modifier,
                t2.flag))* 1000000000
                + (3 * STDDEV(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                        t1.cro,
                        t1.assay_type,
                        t1.cell_line,
                        t1.variant,
                        t1.cell_incubation_hr,
                        t1.pct_serum,
                        t1.threed,
                        t1.treatment,
                        t1.modifier,
                        t2.flag) * 1000000000)), 3) AS nM_plus_3_stdev,
                    round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.cell_line,
            t1.variant,
            t1.cell_incubation_hr,
            t1.pct_serum,
            t1.threed,
            t1.treatment,
            t1.modifier,
            t2.flag))* 1000000000
                - (3 * VARIANCE(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                        t1.cro,
                        t1.assay_type,
                        t1.cell_line,
                        t1.variant,
                        t1.cell_incubation_hr,
                        t1.pct_serum,
                        t1.threed,
                        t1.treatment,
                        t1.modifier,
                        t2.flag) * 1000000000)), 3) AS nm_minus_3_var,
        round(abs(power(10, AVG(log(10, t1.ic50))
            OVER(PARTITION BY t1.compound_id,
                t1.cro,
                t1.assay_type,
                t1.cell_line,
                t1.variant,
                t1.cell_incubation_hr,
                t1.pct_serum,
                t1.threed,
                t1.treatment,
                t1.modifier,
                t2.flag))* 1000000000
                + (3 * VARIANCE(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                        t1.cro,
                        t1.assay_type,
                        t1.cell_line,
                        t1.variant,
                        t1.cell_incubation_hr,
                        t1.pct_serum,
                        t1.threed,
                        t1.treatment,
                        t1.modifier,
                        t2.flag) * 1000000000)), 3) AS nM_plus_3_var,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.cell_line,
            t1.variant,
            t1.cell_incubation_hr,
            t1.pct_serum,
            t1.threed,
            t1.treatment,
            t1.modifier,
            t2.flag) AS n,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.cell_line,
            t1.variant,
            t1.cell_incubation_hr,
            t1.pct_serum,
            t1.threed,
            t1.treatment) AS m
    FROM
        ds3_userdata.su_cellular_growth_drc t1
        LEFT OUTER JOIN ds3_userdata.CELLULAR_IC50_FLAGS t2 ON t1.PID = t2.PID
    WHERE
            t1.assay_intent = 'Screening'
            AND t1.validated = 'VALIDATED'
    ) t0
    WHERE
        t0.modifier IS NULL
        AND t0.COMPOUND_ID = '{0}'
    GROUP BY
        t0.compound_id,
        t0.cro,
        t0.assay_type,
        t0.cell_line,
        t0.variant,
        t0.cell_incubation_hr,
        t0.pct_serum,
        t0.threed,
        t0.treatment
    """,
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
    "GEOMEAN_BIO_STATS": """
    SELECT
        max(t0.compound_id) AS COMPOUND_ID,
        max(t0.cro) AS CRO,
        max(t0.assay_type) AS ASSAY_TYPE,
        max(t0.TARGET) AS TARGET,
        max(t0.variant) AS VARIANT,
        max(t0.COFACTORS) AS COFACTORS,
        max(t0.ATP_CONC_UM) AS ATP_CONC_UM,
        max(t0.geomean_nM) AS GEOMEAN,
        max(t0.nm_minus_3_stdev) AS MINUS_3STDEV,
        max(t0.nm_plus_3_stdev) AS PLUS_3STDEV,
        max(t0.nm_minus_3_var) AS MINUS_3VAR,
        max(t0.nm_plus_3_var) AS PLUS_3VAR,
        max(t0.n) || ' of ' || max(t0.m) AS N_OF_M,
        max(t0.stdev) as STDEV
    FROM (
        SELECT
        t1.cro,
        t1.assay_type,
        t1.compound_id,
        t1.batch_id,
        t1.target,
        nvl(t1.variant, '-') AS variant,
        t1.cofactors,
        t1.atp_conc_um,
        t1.modifier,
        t2.flag,
        round(stddev(t1.ic50) OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.target,
            t1.variant,
            t1.cofactors,
            t1.atp_conc_um,
            t1.modifier,
            t2.flag) * 1000000000, 2) AS stdev,
        round((to_char(power(10, avg(log(10, t1.ic50)) OVER(PARTITION BY
            t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.target,
            t1.variant,
            t1.cofactors,
            t1.atp_conc_um,
            t1.modifier,
        t2.flag)), '99999.99EEEE') * 1000000000), 1) AS geomean_nM,
        round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
              t1.cro,
              t1.assay_type,
              t1.target,
              t1.variant,
              t1.cofactors,
              t1.atp_conc_um,
              t1.modifier,
              t2.flag))* 1000000000
                - (3 * STDDEV(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                    t1.cro,
                    t1.assay_type,
                    t1.target,
                    t1.variant,
                    t1.cofactors,
                    t1.atp_conc_um,
                    t1.modifier,
                    t2.flag) * 1000000000)), 3) AS nm_minus_3_stdev,
        round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
              t1.cro,
              t1.assay_type,
              t1.target,
              t1.variant,
              t1.cofactors,
              t1.atp_conc_um,
              t1.modifier,
              t2.flag))* 1000000000
                + (3 * STDDEV(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                        t1.cro,
                        t1.assay_type,
                        t1.target,
                        t1.variant,
                        t1.cofactors,
                        t1.atp_conc_um,
                        t1.modifier,
                        t2.flag) * 1000000000)), 3) AS nM_plus_3_stdev,
        round(ABS(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
              t1.cro,
              t1.assay_type,
              t1.target,
              t1.variant,
              t1.cofactors,
              t1.atp_conc_um,
              t1.modifier,
              t2.flag))* 1000000000
                - (3 * VARIANCE(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                        t1.cro,
                        t1.assay_type,
                        t1.target,
                        t1.variant,
                        t1.cofactors,
                        t1.atp_conc_um,
                        t1.modifier,
                        t2.flag) * 1000000000)), 3) AS nm_minus_3_var,
        round(abs(power(10, AVG(log(10, t1.ic50))
          OVER(PARTITION BY t1.compound_id,
              t1.cro,
              t1.assay_type,
              t1.target,
              t1.variant,
              t1.cofactors,
              t1.atp_conc_um,
              t1.modifier,
              t2.flag))* 1000000000
                + (3 * VARIANCE(t1.ic50)
                    OVER(PARTITION BY t1.compound_id,
                    t1.cro,
                    t1.assay_type,
                    t1.target,
                    t1.variant,
                    t1.cofactors,
                    t1.atp_conc_um,
                    t1.modifier,
                    t2.flag) * 1000000000)), 3) AS nM_plus_3_var,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id, t1.cro,
            t1.assay_type,
            t1.target,
            t1.variant,
            t1.cofactors,
            t1.atp_conc_um,
            t1.modifier,
            t2.flag) AS n,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id,
            t1.cro,
            t1.assay_type,
            t1.target,
            t1.variant,
            t1.cofactors,
            t1.atp_conc_um) AS m
    FROM
        ds3_userdata.su_biochem_drc t1
        LEFT OUTER JOIN ds3_userdata.BIOCHEM_IC50_FLAGS t2 ON t1.PID = t2.PID
    WHERE
            t1.assay_intent = 'Screening'
            AND t1.validated = 'VALIDATED'
    ) t0
    WHERE
        t0.modifier IS NULL
        AND t0.COMPOUND_ID = '{0}'
    GROUP BY
        t0.compound_id,
        t0.cro,
        t0.assay_type,
        t0.target,
        t0.variant,
        t0.cofactors,
        t0.atp_conc_um
    """,
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
    select_columns = [
        "t1.CRO",
        "t1.ASSAY_TYPE",
        "t1.CELL",
        "t1.VARIANT",
        "t1.INC_HR",
        "t1.PCT_SERUM",
    ]

    # print(mdict)
    cmp_ids = mdict["COMPOUND_ID"].split(",")
    where_conditions = []

    for i, cmp_id in enumerate(cmp_ids):
        where_conditions.append(f"t{i+1}.COMPOUND_ID = '{cmp_id}'")

    where_conditions.append(
        f"""
            t1.CRO = '{ mdict['CRO'] }'
            AND t1.ASSAY_TYPE = '{ mdict['ASSAY_TYPE'] }'
            AND t1.INC_HR = { mdict['CELL_INCUBATION_HR'] }
            AND t1.PCT_SERUM = { mdict['PCT_SERUM'] }
            """
    )
    where_clause = " AND ".join(where_conditions)

    join_clause = ""
    join_clause = ""
    for i, cmp_id in enumerate(cmp_ids):
        if i > 0:
            join_clause += f""" INNER JOIN SU_CELLULAR_DRC_STATS t{i+1} ON
                t{i+1}.CRO = t{i}.CRO
                AND t{i+1}.ASSAY_TYPE = t{i}.ASSAY_TYPE
                AND t{i+1}.INC_HR = t{i}.INC_HR
                AND t{i+1}.PCT_SERUM = t{i}.PCT_SERUM
                """
        else:
            join_clause += f" SU_CELLULAR_DRC_STATS t{i+1}"

    select_clause = ", ".join(
        [
            f"t{i+1}.COMPOUND_ID COMPOUND_ID_{i+1}, t{i+1}.GEO_NM GEO_NM_{i+1}"
            if i > 0
            else f"t{i+1}.COMPOUND_ID COMPOUND_ID_1, t{i+1}.GEO_NM GEO_NM_1"
            for i in range(len(cmp_ids))
        ]
    )
    select_clause += ", " + ", ".join(select_columns)

    return f"""SELECT {select_clause}
                    FROM {join_clause}
                    WHERE {where_clause}
                    ORDER BY CELL, VARIANT
                    """
