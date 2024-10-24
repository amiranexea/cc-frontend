import { mutate } from 'swr';
import { m } from 'framer-motion';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import {
  Box,
  Stack,
  Button,
  Divider,
  Backdrop,
  IconButton,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import useGetCampaigns from 'src/hooks/use-get-campaigns';

import { endpoints } from 'src/utils/axios';

import { _tours } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';
import useSocketContext from 'src/socket/hooks/useSocketContext';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

import CreatorForm from '../creator-form';
import CampaignLists from '../campaign-list';
import CampaignSearch from '../campaign-search';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function CampaignListView() {
  const settings = useSettingsContext();
  const { campaigns, isLoading } = useGetCampaigns('creator');
  const [filter, setFilter] = useState('');
  const { user } = useAuthContext();
  const dialog = useBoolean();
  const backdrop = useBoolean(!user?.creator?.isFormCompleted);

  const load = useBoolean();
  const [upload, setUpload] = useState([]);
  const { socket } = useSocketContext();
  const smUp = useResponsive('up', 'sm');

  useEffect(() => {
    // Define the handler function
    const handlePitchLoading = (data) => {
      if (upload.find((item) => item.campaignId === data.campaignId)) {
        setUpload((prev) =>
          prev.map((item) =>
            item.campaignId === data.campaignId
              ? {
                  campaignId: data.campaignId,
                  loading: true,
                  progress: Math.floor(data.progress),
                }
              : item
          )
        );
      } else {
        setUpload((item) => [
          ...item,
          { loading: true, campaignId: data.campaignId, progress: Math.floor(data.progress) },
        ]);
      }
    };

    const handlePitchSuccess = (data) => {
      mutate(endpoints.campaign.getAllActiveCampaign);
      enqueueSnackbar(data.name);
      setUpload((prevItems) => prevItems.filter((item) => item.campaignId !== data.campaignId));
    };

    // Attach the event listener
    socket?.on('pitch-loading', handlePitchLoading);
    socket?.on('pitch-uploaded', handlePitchSuccess);

    // Clean-up function
    return () => {
      socket?.off('pitch-loading', handlePitchLoading);
      socket?.off('pitch-uploaded', handlePitchSuccess);
    };
  }, [socket, upload]);

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = _tours.filter(
          (tour) => tour.name.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

  const renderUploadProgress = (
    <Box
      component={m.div}
      transition={{ ease: 'easeInOut', duration: 0.4 }}
      animate={load.value ? { height: 400 } : { height: 50 }}
      sx={{
        position: 'fixed',
        bottom: 0,
        right: smUp ? 50 : 0,
        width: smUp ? 300 : '100vw',
        height: load.value ? 400 : 50,
        bgcolor: (theme) => theme.palette.background.default,
        boxShadow: 20,
        border: 1,
        borderBottom: 0,
        borderRadius: '10px 10px 0 0',
        borderColor: 'text.secondary',
        p: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ position: 'absolute', top: 10 }}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <IconButton
            sx={{
              transform: load.value ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onClick={load.onToggle}
          >
            <Iconify icon="bxs:up-arrow" />
          </IconButton>
          <Typography variant="subtitle2">Uploading {upload.length} files</Typography>
        </Stack>
      </Box>

      <Stack mt={5} gap={2}>
        {upload.map((elem) => (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <ListItemText
                primary={campaigns && campaigns.find((item) => item.id === elem.campaignId)?.name}
                secondary="Uploading pitch"
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <CircularProgress
                variant="determinate"
                value={elem.progress}
                size={20}
                thickness={7}
              />
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </>
        ))}
      </Stack>
    </Box>
  );

  const filteredData = applyFilter({ inputData: campaigns, filter, user });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <ListItemText
        primary="Discover Campaigns ✨"
        secondary="Here are the top campaigns that fit your profile!"
        primaryTypographyProps={{
          variant: 'h3',
        }}
        secondaryTypographyProps={{
          variant: 'body1',
          color: 'text.secondary',
        }}
        sx={{
          mb: 3,
        }}
      />
      {/* <Typography
        variant="h3"
        sx={{
          mb: 3,
        }}
      >
        Discover Campaigns ✨
      </Typography> */}

      <CampaignSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        campaigns={campaigns}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} my={1.5}>
          <Button
            size="small"
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="small"
            variant={filter === 'saved' ? 'contained' : 'outlined'}
            onClick={() => setFilter('saved')}
          >
            Saved
          </Button>
          <Button
            size="small"
            color="warning"
            variant={filter === 'draft' ? 'contained' : 'outlined'}
            onClick={() => setFilter('draft')}
          >
            Draft
          </Button>
        </Stack>

        <Backdrop
          open={backdrop.value}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          // onClick={backdrop.onFalse}
        >
          <Box
            sx={{
              bgcolor: (theme) => theme.palette.background.paper,
              borderRadius: 2,
              p: 4,
              pb: 2,
              width: 600,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'inline-block',
                position: 'absolute',
                top: 20,
                right: 20,
              }}
            >
              <IconButton onClick={backdrop.onFalse}>
                <Iconify icon="mingcute:close-fill" />
              </IconButton>
            </Box>
            <ListItemText
              primary="Complete Your Profile Before Making a Pitch"
              secondary="Before you can submit a pitch for this campaign, please complete your profile form. This ensures we have all the necessary information for your submission. Click below to finish filling out your form and get ready to pitch!"
              primaryTypographyProps={{
                variant: 'subtitle1',
              }}
              secondaryTypographyProps={{
                variant: 'subtitle2',
              }}
              sx={{
                my: 3,
              }}
            />
            <CreatorForm dialog={dialog} user={user} display backdrop={backdrop} />
          </Box>
        </Backdrop>
      </Stack>

      <Box sx={{ my: 2 }} />

      {isLoading && <LoadingScreen />}

      {!isLoading &&
        (filteredData?.length > 0 ? (
          <CampaignLists campaigns={filteredData} />
        ) : (
          <EmptyContent title="No campaign available" />
        ))}
      {/* {filteredData && filteredData?.length > 0 ? (
        <CampaignLists campaigns={filteredData} />
      ) : (
        <EmptyContent title="No campaign available" />
      )} */}

      {upload.length > 0 && renderUploadProgress}

      {!user?.creator?.isFormCompleted && <CreatorForm dialog={dialog} user={user} />}
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, filter, user }) => {
  if (filter === 'saved') {
    inputData = inputData?.filter((campaign) => campaign.bookMarkCampaign);
  }

  if (filter === 'draft') {
    inputData = inputData?.filter((campaign) =>
      campaign.pitch?.some((elem) => elem?.userId === user?.id && elem?.status === 'draft')
    );
  }

  return inputData;
};

// const applyFilter = ({ inputData, filters, sortBy, dateError }) => {
//   const { services, destination, startDate, endDate, tourGuides } = filters;

//   const tourGuideIds = tourGuides.map((tourGuide) => tourGuide.id);

//   // SORT BY
//   if (sortBy === 'latest') {
//     inputData = orderBy(inputData, ['createdAt'], ['desc']);
//   }

//   if (sortBy === 'oldest') {
//     inputData = orderBy(inputData, ['createdAt'], ['asc']);
//   }

//   if (sortBy === 'popular') {
//     inputData = orderBy(inputData, ['totalViews'], ['desc']);
//   }

//   // FILTERS
//   if (destination.length) {
//     inputData = inputData.filter((tour) => destination.includes(tour.destination));
//   }

//   if (tourGuideIds.length) {
//     inputData = inputData.filter((tour) =>
//       tour.tourGuides.some((filterItem) => tourGuideIds.includes(filterItem.id))
//     );
//   }

//   if (services.length) {
//     inputData = inputData.filter((tour) => tour.services.some((item) => services.includes(item)));
//   }

//   if (!dateError) {
//     if (startDate && endDate) {
//       inputData = inputData.filter((tour) =>
//         isBetween(startDate, tour.available.startDate, tour.available.endDate)
//       );
//     }
//   }

//   return inputData;
// };
