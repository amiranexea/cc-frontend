import React from 'react';
import PropTypes from 'prop-types';

import { Box, Stack, Typography } from '@mui/material';

import MediaKitAnalytics from './media-kit-analytic/view';
import MediaKitPartnership from '../medit-kit-partnerships';
import MediaKitSocialContentTiktok from './media-kit-social-content/view-tiktok';
import MediaKitSocialContentInstagram from './media-kit-social-content/view-instagram';

const MediaKitSocial = ({ currentTab, data, isLoading }) => (
  <Box
    sx={{
      borderRadius: 2,
      [`& .Mui-selected`]: {
        bgcolor: (theme) => theme.palette.background.paper,
        borderRadius: 1.5,
      },
    }}
  >
    {isLoading && <Typography>Loading...</Typography>}

    {currentTab === 'instagram' && (
      <Stack gap={4}>
        <MediaKitSocialContentInstagram instagram={data?.instagram} />
        <MediaKitAnalytics />
      </Stack>
    )}
    {currentTab === 'tiktok' && (
      <Stack gap={4}>
        <MediaKitSocialContentTiktok tiktok={data?.tiktok} />
      </Stack>
    )}
    {currentTab === 'partnerships' && <MediaKitPartnership />}
  </Box>
);

export default MediaKitSocial;

MediaKitSocial.propTypes = {
  currentTab: PropTypes.string.isRequired,
  data: PropTypes.object,
  isLoading: PropTypes.bool,
};
