import React, { useReducer, useState, useEffect } from 'react'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import AutocompleteBox from './AutocompleteBox'
import axios from 'axios'

const Pane = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(5),
  justifyContent: 'center',
  alignItems: 'center',
}))

const Home = () => {
  const {
    REACT_APP_BACKEND_URL = 'http://localhost:8000',
    REACT_APP_FRONTEND_URL = 'http://localhost:3000',
  } = process.env
  const backendURL = `${REACT_APP_BACKEND_URL}/compound_ids`
  const frontendURL = `${REACT_APP_FRONTEND_URL}/get-data?compound_id=`
  console.log(`back: ${backendURL}, front: ${frontendURL}`)
  const [error, setError] = useState('')
  const initialState = {
    dsType: null,
    cmpIDinputValue: 'FT002787',
    cmpIDoptions: [],
  }

  const handleRadioButtonChange = (e) => {
    dispatch({ type: 'dsType', payload: e.target.value })
  }

  const handleOnChangeAutocomplete = (e, val) => {
    e.preventDefault()
    dispatch({ type: 'cmpIDinputValue', payload: val })
  }

  const handleSearchCmpdIDBtnClick = (e) => {
    const inputValue = state.cmpIDinputValue
    if (!state.dsType) {
      e.preventDefault()
      setError('Error: Please select a data source type!')
    } else if (!inputValue.startsWith('FT')) {
      e.preventDefault()
      setError('Error: Invalid compound ID!')
    } else {
      setError('')
      console.log(inputValue)
    }
  }
  const reducer = (state, action) => {
    switch (action.type) {
      case 'dsType':
        return { ...state, dsType: action.payload }
      case 'cmpIDinputValue':
        return { ...state, cmpIDinputValue: action.payload }
      case 'cmpIDoptions':
        return { ...state, cmpIDoptions: action.payload }
      default:
        return state
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState)
  const loading = state.cmpIDoptions.length === 0

  useEffect(() => {
    ;(async () => {
      await axios.get(backendURL).then((res) => {
        dispatch({
          type: 'cmpIDoptions',
          payload: res.data.data || [],
        })
        // console.log(res.data.data)
      })
    })()
    // eslint-disable-next-line
  }, [])

  return (
    <Grid
      container
      direction='column'
      justifyContent='center'
      alignItems='center'
      sx={{
        marginTop: '100px',
      }}
    >
      <Pane>
        <h1>Kinnate Geomean Viewer</h1>
        <Grid item xs={12}>
          <AutocompleteBox
            options={state.cmpIDoptions}
            loading={loading}
            handleOnChangeAutocomplete={handleOnChangeAutocomplete}
            value={state.cmpIDinputValue}
            error={error}
          />
        </Grid>

        <Grid item xs={12}>
          <RadioGroup name='dsource-radio-group'>
            <FormControlLabel
              value='biochem_stats'
              control={<Radio />}
              label='Biochemical'
              color='default'
              onChange={handleRadioButtonChange}
            />
            <FormControlLabel
              value='cellular_stats'
              control={<Radio />}
              label='Cellular'
              color='default'
              onChange={handleRadioButtonChange}
            />
          </RadioGroup>
        </Grid>
        <Grid item xs={12} style={{ width: '100%' }}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            href={`${frontendURL}${state.cmpIDinputValue}&sql_type=get&type=${state.dsType}`}
            onClick={handleSearchCmpdIDBtnClick}
          >
            Search
          </Button>
        </Grid>
      </Pane>
    </Grid>
  )
}

export default Home
