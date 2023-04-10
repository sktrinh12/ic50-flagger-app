import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export default function AutocompleteBox({
  options,
  value,
  loading,
  handleOnChangeAutocomplete,
  error,
}) {
  return (
    <Autocomplete
      id='cmpd-id-search'
      value={value}
      options={options}
      loading={loading}
      onChange={handleOnChangeAutocomplete}
      renderInput={(params) => (
        <TextField
          {...params}
          variant='standard'
          label='Compound ID'
          fullWidth
          error={error !== ''}
          helperText={error}
          required
        />
      )}
    />
  )
}
