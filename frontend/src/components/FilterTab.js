import * as React from "react";
import { Toolbar, InputAdornment, Drawer } from "@mui/material";
import Input from "./controls/Control";
import SearchIcon from "@mui/icons-material/Search";

const styles = {
  position: "relative",
  marginRight: "auto",
  width: 200,
  "& .MuiBackdrop-root": {
    display: "none",
  },
  "& .MuiDrawer-paper": {
    width: 240,
    // position: "absolute",
    flexShrink: 0,
    height: 700,
    padding: "10px",
    marginTop: "90px",
  },
};

const inputStyles = {
  borderRadius: "2px",
  padding: "10px",
};

const FilterTab = ({ dtype, open, handleSearchFilter }) => {
  return (
    <Drawer open={open} sx={styles} variant="persistent" anchor="right">
      {/cellular_all|cellular_stats/.test(dtype) && (
        <>
          <Toolbar style={inputStyles}>
            <Input
              label="Cell Line"
              className={"width: 25%"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter("CELL_LINE")}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label="Variant"
              className={"width: 25%"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter("VARIANT")}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label="Cell Incu (hr)"
              className={"width: 25%"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter("CELL_INCUBATION_HR")}
            />
          </Toolbar>
        </>
      )}
      {dtype.includes("stats") && (
        <Toolbar style={inputStyles}>
          <Input
            label="Assay Type"
            className={"width: 25%"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleSearchFilter("ASSAY_TYPE")}
          />
        </Toolbar>
      )}
      {/all|agg/.test(dtype) && (
        <Toolbar style={inputStyles}>
          <Input
            label="Passage #"
            className={"width: 25%"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleSearchFilter("PASSAGE_NUMBER")}
          />
        </Toolbar>
      )}
    </Drawer>
  );
};

export default FilterTab;
