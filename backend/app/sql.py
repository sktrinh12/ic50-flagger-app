field_names_dct = { 'cellular_stats_fields': [
    'COMPOUND_ID',
    'CRO',
    'ASSAY_TYPE',
    'CELL_LINE',
    'VARIANT',
    'CELL_INCUBATION_HR',
    'PCT_SERUM',
    'MINUS_3STDEV',
    'PLUS_3STDEV',
    'MINUS_3VAR',
    'PLUS_3VAR',
    'GEOMEAN',
    'N_OF_M',
    'STDEV'
],

'cellular_all_fields': [
    'PID',
    'CRO',
    'ASSAY_TYPE',
    'COMPOUND_ID',
    'EXPERIMENT_ID',
    'BATCH_ID',
    'CELL_LINE',
    'VARIANT',
    'PCT_SERUM',
    'PASSAGE_NUMBER',
    'WASHOUT',
    'CELL_INCUBATION_HR',
    'PLOT',
    'IC50_NM',
    'FLAG',
    'GEOMEAN'
],

'biochem_stats_fields': [
    'COMPOUND_ID',
    'CRO',
    'ASSAY_TYPE',
    'ATP_CONC_UM',
    'COFACTORS',
    'TARGET',
    'GEOMEAN',
    'MINUS_3STDEV',
    'PLUS_3STDEV',
    'MINUS_3VAR',
    'PLUS_3VAR',
    'N_OF_M',
    'STDEV'
],

'biochem_all_fields': [
    'PID',
    'CRO',
    'ASSAY_TYPE',
    'COMPOUND_ID',
    'EXPERIMENT_ID',
    'BATCH_ID',
    'TARGET',
    'VARIANT',
    'COFACTORS',
    'ATP_CONC_UM',
    'MODIFIER',
    'PLOT',
    'IC50_NM',
    'FLAG',
    'GEOMEAN'
]}

sql_cmds = {

'GEOMEAN_CELL_STATS': 
    """
    SELECT
        max(t0.compound_id) AS COMPOUND_ID,
        max(t0.cro) AS CRO,
        max(t0.assay_type) AS ASSAY_TYPE,
        max(t0.cell_line) AS CELL_LINE,
        max(t0.variant) AS VARIANT,
        max(t0.cell_incubation_hr) AS CELL_INCUBATION_HR,
        max(t0.pct_serum) AS PCT_SERUM,
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
        t2.flag,
        round(stddev(t1.ic50) OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant, t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag) * 1000000000, 2) AS stdev,
        round((to_char(power(10, avg(log(10, t1.ic50)) OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant, t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag)), '99999.99EEEE') * 1000000000), 1) AS geomean_nM,
        round(ABS(power(10, AVG(log(10, t1.ic50))
                      OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant,
                                        t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag))* 1000000000 
                                        - (3 * STDDEV(t1.ic50)
                                            OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.
                                            cell_line, t1.variant, t1.cell_incubation_hr,
                                            t1.pct_serum,t1.modifier, t2.flag) * 1000000000)), 3) AS nm_minus_3_stdev,
        round(ABS(power(10, AVG(log(10, t1.ic50))
                      OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant,
                                        t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag))* 1000000000 
                                        + (3 * STDDEV(t1.ic50)
                                            OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.
                                            cell_line, t1.variant, t1.cell_incubation_hr,
                                            t1.pct_serum,t1.modifier, t2.flag) * 1000000000)), 3) AS nM_plus_3_stdev,
        round(ABS(power(10, AVG(log(10, t1.ic50))
                      OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant,
                                        t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag))* 1000000000 
                                        - (3 * VARIANCE(t1.ic50)
                                            OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.
                                            cell_line, t1.variant, t1.cell_incubation_hr,
                                            t1.pct_serum,t1.modifier, t2.flag) * 1000000000)), 3) AS nm_minus_3_var,
        round(abs(power(10, AVG(log(10, t1.ic50))
                      OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant,
                                        t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag))* 1000000000 
                                        + (3 * VARIANCE(t1.ic50)
                                            OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.
                                            cell_line, t1.variant, t1.cell_incubation_hr,
                                            t1.pct_serum,t1.modifier, t2.flag) * 1000000000)), 3) AS nM_plus_3_var,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant, t1.cell_incubation_hr, t1.pct_serum, t1.modifier, t2.flag) AS n,
        count(t1.ic50) OVER(PARTITION BY t1.compound_id, t1.cro, t1.assay_type, t1.cell_line, t1.variant, t1.cell_incubation_hr, t1.pct_serum) AS m
    FROM
        ds3_userdata.su_cellular_growth_drc t1
        INNER JOIN ds3_userdata.CELLULAR_IC50_FLAGS t2 ON t1.PID = t2.PID
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
    t0.pct_serum
    """,

'GEOMEAN_CELL_ALL':
    """SELECT
        t3.PID,
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
         t1.PCT_SERUM,
         t1.WASHOUT,
         t1.PASSAGE_NUMBER,
         t1.CELL_INCUBATION_HR,
         t1.GRAPH,
         t2.FLAG,
         t1.ic50,
         t1.PID,
         t1.ic50_nm
    FROM DS3_USERDATA.SU_CELLULAR_GROWTH_DRC t1
    INNER JOIN DS3_USERDATA.CELLULAR_IC50_FLAGS t2
    ON t1.pid = t2.pid) t3
    """,

    'GEOMEAN_BIO_STATS':
    """
        SELECT
            COMPOUND_ID,
            CRO,
            ASSAY_TYPE,
            ATP_CONC_UM,
            COFACTORS,
            TARGET,
            GEO_NM,
            N_OF_M,
            STDEV
        FROM DS3_USERDATA.FT_BIOCHEM_DRC_STATS
        WHERE
        COMPOUND_ID = '{0}'
    """,

    'GEOMEAN_BIO_ALL':
        """SELECT
                t3.PID,
                t3.CRO,
                t3.ASSAY_TYPE,
                t3.COMPOUND_ID,
                t3.EXPERIMENT_ID,
                t3.BATCH_ID,
                t3.TARGET,
                t3.VARIANT,
                t3.COFACTORS,
                t3.ATP_CONC_UM,
                t3.MODIFIER,
                BASE64ENCODE(t3.GRAPH) as GRAPH,
                ROUND(t3.ic50_nm,2) as IC50_NM,
                t3.flag,
             ROUND( POWER(10,
               AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
                    t3.CRO,
                    t3.ASSAY_TYPE,
                    t3.COMPOUND_ID,
                    t3.TARGET,
                    t3.VARIANT,
                    t3.COFACTORS,
                    t3.ATP_CONC_UM,
                    t3.MODIFIER,
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
                     t1.COFACTORS,
                     t1.ATP_CONC_UM,
                     t1.MODIFIER,
                     t1.GRAPH,
                     t2.flag,
                     t1.ic50,
                     t1.ic50_nm,
                     t1.PID
               FROM DS3_USERDATA.ENZYME_INHIBITION_VW t1
               INNER JOIN DS3_USERDATA.BIOCHEM_IC50_FLAGS t2
               ON t1.pid = t2.pid) t3
            """
}
