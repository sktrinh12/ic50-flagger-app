import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function RadioButtonsGroup({ flagValue, handleEditFormChange }) {
  return (
    <FormControl>
      <FormLabel></FormLabel>
      <RadioGroup
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={flagValue}
        onChange={handleEditFormChange}
      >
        <FormControlLabel value="include" control={<Radio />} label="Include" />
        <FormControlLabel value="exclude" control={<Radio />} label="Exclude" />
      </RadioGroup>
    </FormControl>
  );
}
