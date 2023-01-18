import * as React from 'react'
import { Toolbar, InputAdornment, Drawer } from '@mui/material'
import Input from './controls/Control'
// import MSRButton from './MSRButton'
import SearchIcon from '@mui/icons-material/Search'
import InsertChartIcon from '@mui/icons-material/InsertChart'
import Divider from '@mui/material/Divider'
import { Link } from 'react-router-dom'
import IconButton from '@mui/joy/IconButton'

const styles = {
  position: 'relative',
  marginRight: 'auto',
  width: 200,
  '& .MuiBackdrop-root': {
    display: 'none',
  },
  '& .MuiDrawer-paper': {
    width: 240,
    // position: "absolute",
    flexShrink: 0,
    height: 700,
    padding: '10px',
    marginTop: '90px',
  },
}

const inputStyles = {
  borderRadius: '2px',
  padding: '10px',
}

const FilterTab = ({
  dtype,
  open,
  handleSearchFilter,
  handleNavToPlot,
  nLimit,
  handleNlimitChange,
}) => {
  return (
    <Drawer open={open} sx={styles} variant='persistent' anchor='right'>
      {/cellular_all|cellular_stats/.test(dtype) && (
        <>
          <Toolbar style={inputStyles}>
            <Input
              label='Cell Line'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('CELL_LINE')}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label='Variant'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('VARIANT')}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label='Cell Incu (hr)'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('CELL_INCUBATION_HR')}
            />
          </Toolbar>
        </>
      )}
      {/biochem_all|biochem_stats/.test(dtype) && (
        <>
          <Toolbar style={inputStyles}>
            <Input
              label='Target'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('TARGET')}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label='Variant'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('VARIANT')}
            />
          </Toolbar>
          <Toolbar style={inputStyles}>
            <Input
              label='Cofactors'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearchFilter('COFACTORS')}
            />
          </Toolbar>
        </>
      )}
      {dtype.includes('stats') && (
        <Toolbar style={inputStyles}>
          <Input
            label='Assay Type'
            className={'width: 25%'}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleSearchFilter('ASSAY_TYPE')}
          />
        </Toolbar>
      )}
      {/cellular_all|cellular_agg/.test(dtype) && (
        <Toolbar style={inputStyles}>
          <Input
            label='Passage #'
            className={'width: 25%'}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleSearchFilter('PASSAGE_NUMBER')}
          />
        </Toolbar>
      )}
      {/_all|_agg/.test(dtype) && (
        <>
          <Divider />
          <Toolbar style={inputStyles}>
            <Input
              label='N most recent MSR calc'
              className={'width: 25%'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Link to='/plot' target='_blank'>
                      <IconButton onClick={handleNavToPlot}>
                        <InsertChartIcon />
                      </IconButton>
                    </Link>
                  </InputAdornment>
                ),
              }}
              onChange={handleNlimitChange}
              value={nLimit}
            />
          </Toolbar>
          <Divider />
        </>
      )}
    </Drawer>
  )
}

export default FilterTab
