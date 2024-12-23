import React from 'react';
import PropTypes from 'prop-types';

import { Box, Grid, Stack, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import CustomChip from 'src/components/custom-chip/custom-chip';

const CampaignDetailBrand = ({ brand, campaign }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      <Box
        sx={{
          bgcolor: (theme) => theme.palette.background.paper,
          width: '100%',
          borderRadius: 1.5,
          p: 2,
        }}
      >
        <Typography variant="h4">General Information</Typography>
        <Stack mt={2} spacing={2}>
          <Typography variant="h6" color="text.secondary">
            {brand?.name}
          </Typography>
          <Stack>
            <Typography variant="h4">About</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {brand?.description || brand?.about || '-'}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h4">Brand Tone</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {campaign?.brandTone || '-'}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="h4">Product / Service name</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {campaign?.productName || '-'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {brand?.industries?.length > 0 &&
              brand?.industries.map((item, index) => <CustomChip key={index} label={item} />)}
          </Stack>
        </Stack>
      </Box>
    </Grid>
    <Grid item xs={12} md={4}>
      <Box
        sx={{
          bgcolor: (theme) => theme.palette.background.paper,
          width: '100%',
          borderRadius: 1.5,
          p: 2,
        }}
      >
        <Typography variant="h5">Socials</Typography>
        <Stack mt={2} spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="ic:baseline-email" />
            <Typography variant="subtitle2">{brand?.email}</Typography>
          </Stack>
          {/* <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="ic:baseline-phone" />
            <Typography variant="subtitle2">{brand?.phone}</Typography>
          </Stack> */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="iconoir:www" />
            <Typography variant="subtitle2">{brand?.website}</Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="mdi:instagram" />
            <Typography variant="subtitle2">{brand?.instagram ?? '-'}</Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="ic:baseline-tiktok" />
            <Typography variant="subtitle2">{brand?.tiktok ?? '-'}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Grid>
  </Grid>
);

export default CampaignDetailBrand;

CampaignDetailBrand.propTypes = {
  brand: PropTypes.any,
  campaign: PropTypes.any,
};
