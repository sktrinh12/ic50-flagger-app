import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

export default function RadioButtonsGroup({
  flag,
  data,
  commentRef,
  handleEditFormChange,
}) {
  return (
    <FormControl>
      <FormLabel></FormLabel>
      <RadioGroup
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={flag}
        onChange={handleEditFormChange}
      >
        <FormControlLabel value="include" control={<Radio />} label="Include" />
        <FormControlLabel
          value="exclude"
          control={<Radio />}
          label="Exclude"
          style={{ marginTop: "-12px" }}
        />
      </RadioGroup>

      <Tooltip
        title={data.CHANGE_DATE}
        arrow
        open={true}
        placement="bottom"
        PopperProps={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -10],
              },
            },
          ],
        }}
      >
        <TextField
          label="Comments"
          multiline
          rows={4}
          ref={commentRef}
          defaultValue={data.COMMENT_TEXT}
          helperText={data.USER_NAME}
        />
      </Tooltip>
    </FormControl>
  );
}
