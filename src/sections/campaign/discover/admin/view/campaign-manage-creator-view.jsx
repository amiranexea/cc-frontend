/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import { useTheme } from '@emotion/react';
import { PDFViewer } from '@react-pdf/renderer';
import React, { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Tab,
  Card,
  Tabs,
  Grid,
  Stack,
  alpha,
  Button,
  Avatar,
  Container,
  Typography,
  tabsClasses,
  ListItemText,
  CircularProgress,
  IconButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useGetSubmissions } from 'src/hooks/use-get-submission';
import useGetCreatorById from 'src/hooks/useSWR/useGetCreatorById';
import { useGetCampaignById } from 'src/hooks/use-get-campaign-by-id';
import useGetInvoiceByCreatorAndCampaign from 'src/hooks/use-get-invoice-creator-camp';

import { _userAbout } from 'src/_mock';
import { bgGradient } from 'src/theme/css';
import { countries } from 'src/assets/data';
import useSocketContext from 'src/socket/hooks/useSocketContext';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content/empty-content';

import InvoicePDF from 'src/sections/invoice/invoice-pdf';

import OverView from '../creator-stuff/overview';
import Submissions from '../creator-stuff/submissions';
import TimelineCreator from '../creator-stuff/timeline/view/page';
import LogisticView from '../creator-stuff/logistics/view/logistic-view';

const CampaignManageCreatorView = ({ id, campaignId }) => {
  const { data, isLoading } = useGetCreatorById(id);
  const [currentTab, setCurrentTab] = useState('profile');
  const { socket } = useSocketContext();
  const { campaign, campaignLoading } = useGetCampaignById(campaignId);
  const {
    data: submissions,
    isLoading: submissionLoading,
    mutate,
  } = useGetSubmissions(id, campaignId);
  const { invoice } = useGetInvoiceByCreatorAndCampaign(id, campaignId);

  // use get invoice by campaign id and creator id
  const theme = useTheme();
  const router = useRouter();

  const interests = data?.user?.creator?.interests;

  const renderTabs = (
    <Box sx={{ mt: 2.5, mb: 2.5 }}>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            bgcolor: 'divider',
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            overflowX: 'auto',
          }}
        >
          {[
            { label: 'Overview', value: 'profile' },
            { label: 'Submissions', value: 'submission' },
            { label: 'Invoice', value: 'invoice' },
            { label: 'Logistics', value: 'logistics' },
            // { label: 'Timeline', value: 'timeline' }, // Add timeline when backend is ready
          ].map((tab) => (
            <Button
              key={tab.value}
              disableRipple
              size="large"
              onClick={() => setCurrentTab(tab.value)}
              sx={{
                px: { xs: 1, sm: 1.5 },
                py: 0.5,
                pb: 1,
                minWidth: 'fit-content',
                color: currentTab === tab.value ? '#221f20' : '#8e8e93',
                position: 'relative',
                fontSize: { xs: '0.9rem', sm: '1.05rem' },
                fontWeight: 650,
                whiteSpace: 'nowrap',
                mr: { xs: 1, sm: 2 },
                transition: 'transform 0.1s ease-in-out',
                '&:focus': {
                  outline: 'none',
                  bgcolor: 'transparent',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                  bgcolor: 'transparent',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  width: currentTab === tab.value ? '100%' : '0%',
                  bgcolor: '#1340ff',
                  transition: 'all 0.3s ease-in-out',
                  transform: 'scaleX(1)',
                  transformOrigin: 'left',
                },
                '&:hover': {
                  bgcolor: 'transparent',
                  '&::after': {
                    width: '100%',
                    opacity: currentTab === tab.value ? 1 : 0.5,
                  },
                },
                mr: 2,
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );

  const shortlistedCreators = useMemo(
    () =>
      !campaignLoading && campaign?.shortlisted
        ? campaign.shortlisted.map((item, index) => ({ index, userId: item?.userId }))
        : [],
    [campaign, campaignLoading]
  );

  const currentIndex = shortlistedCreators.find((a) => a?.userId === id)?.index;

  useEffect(() => {
    if (socket) {
      socket.on('newSubmission', () => {
        mutate();
      });
    }

    return () => {
      socket?.off('newSubmission');
    };
  }, [socket, mutate]);

  return (
    <Container 
      maxWidth="xl"
      sx={{ 
        px: { xs: 2, sm: 5 }
      }}
    >
      <Button
        color="inherit"
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={20} />}
        onClick={() => router.push(paths.dashboard.campaign.adminCampaignDetail(campaign?.id))}
        sx={{
          alignSelf: 'flex-start',
          color: '#636366',
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        Back
      </Button>

      {isLoading && (
        <Box
          sx={{
            position: 'relative',
            top: 200,
            textAlign: 'center',
          }}
        >
          <CircularProgress
            thickness={7}
            size={25}
            sx={{
              color: theme.palette.common.black,
              strokeLinecap: 'round',
            }}
          />
        </Box>
      )}

      {!campaignLoading && (
        <>
          {/* Profile Info - Now without card wrapper */}
          <Box sx={{ p: 3, mb: -2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Avatar
                alt={data?.user?.name}
                src={data?.user?.photoURL}
                sx={{
                  width: 48,
                  height: 48,
                  ml: -2,
                  border: '1px solid #e7e7e7',
                }}
              >
                {data?.user?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography 
                variant="h4"
                sx={{
                  fontFamily: 'Instrument Serif',
                  flex: 1,
                  ml: 2,
                  fontWeight: 580,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  lineHeight: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {`${data?.user?.name?.charAt(0).toUpperCase()}${data?.user?.name?.slice(1)}`}
                <Box
                  component="img"
                  src="/assets/icons/overview/creatorVerified.svg"
                  sx={{
                    width: 20,
                    height: 20,
                    ml: 0.5,
                  }}
                />
              </Typography>

              <Stack direction="row" spacing={1}>
                {data?.user?.creator?.instagram && (
                  <IconButton 
                    component="a" 
                    href={`https://instagram.com/${data?.user?.creator?.instagram}`}
                    target="_blank"
                    sx={{
                      color: '#636366',
                      border: '1px solid #e7e7e7',
                      borderBottom: '3px solid #e7e7e7',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha('#636366', 0.08),
                      },
                    }}
                  >
                    <Iconify icon="mdi:instagram" width={24} />
                  </IconButton>
                )}
                {data?.user?.creator?.tiktok && (
                  <IconButton
                    component="a"
                    href={`https://tiktok.com/@${data?.user?.creator?.tiktok}`}
                    target="_blank"
                    sx={{
                      color: '#636366',
                      border: '1px solid #e7e7e7',
                      borderBottom: '3px solid #e7e7e7',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha('#636366', 0.08),
                      },
                    }}
                  >
                    <Iconify icon="ic:baseline-tiktok" width={24} />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Tabs */}
          {renderTabs}

          {currentTab === 'profile' && (
            <Box sx={{ p: 3 }}>
              {/* Stats Section */}
              <Box
                sx={{
                  width: { xs: '100%', sm: '80%', md: '50%', lg: '35%' },
                  border: '1px solid #e7e7e7',
                  borderRadius: 2,
                  p: 3,
                  ml: { xs: 0, sm: -3 },
                  mt: -1.8,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={3}>
                  {/* Stats Groups */}
                  <Stack spacing={2}>
                    {/* Followers */}
                    <Stack direction="row" spacing={2}>
                      <Box
                        component="img"
                        src="/assets/icons/overview/purpleGroup.svg"
                        sx={{ width: 32, height: 32, alignSelf: 'center' }}
                      />
                      <Stack>
                        <Typography variant="h6">N/A</Typography>
                        <Typography variant="subtitle2" color="#8e8e93" sx={{ fontWeight: 500 }}>
                          Followers
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Engagement Rate */}
                    <Stack direction="row" spacing={2}>
                      <Box
                        component="img"
                        src="/assets/icons/overview/greenChart.svg"
                        sx={{ width: 32, height: 32, alignSelf: 'center' }}
                      />
                      <Stack>
                        <Typography variant="h6">N/A</Typography>
                        <Typography variant="subtitle2" color="#8e8e93" sx={{ fontWeight: 500 }}>
                          Engagement Rate
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Average Likes */}
                    <Stack direction="row" spacing={2}>
                      <Box
                        component="img"
                        src="/assets/icons/overview/bubbleHeart.svg"
                        sx={{ width: 32, height: 32, alignSelf: 'center' }}
                      />
                      <Stack>
                        <Typography variant="h6">N/A</Typography>
                        <Typography variant="subtitle2" color="#8e8e93" sx={{ fontWeight: 500 }}>
                          Average Likes
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Divider */}
                  <Box sx={{ borderTop: '1px solid #e7e7e7' }} />

                  {/* Personal Information */}
                  <Stack spacing={3}>
                    {[
                      {
                        label: 'Pronouns',
                        value: data?.user?.creator?.pronounce,
                        fallback: 'Not specified'
                      },
                      {
                        label: 'Email',
                        value: data?.user?.email,
                        fallback: 'Not specified'
                      },
                      {
                        label: 'Phone',
                        value: data?.user.phoneNumber,
                        fallback: 'Not specified'
                      },
                      {
                        label: 'Location',
                        value: data?.user?.creator?.country || data?.user?.country,
                        fallback: 'Not specified'
                      },
                      {
                        label: 'Interests',
                        value: data?.user?.creator?.interests?.map(interest => (
                          <Box
                            key={interest.name}
                            component="span"
                            sx={{
                              display: 'inline-block',
                              color: '#8e8e93',
                              border: '1px solid #ebebeb',
                              borderBottom: '3px solid #ebebeb',
                              fontWeight: 600,
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.8,
                              mr: 0.5,
                              mb: 0.5,
                              textTransform: 'uppercase',
                              fontSize: '0.8rem',
                            }}
                          >
                            {interest.name}
                          </Box>
                        )),
                        fallback: 'Not specified'
                      }
                    ].map((item) => (
                      <Stack key={item.label} spacing={1}>
                        <Typography variant="subtitle2" color="#8e8e93" sx={{ fontWeight: 600, mt: -0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-word',
                            display: item.label === 'Interests' ? 'flex' : 'block',
                            flexWrap: 'wrap',
                            gap: 0.5
                          }}
                        >
                          {item.value || item.fallback}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}

          {currentTab === 'submission' && (
            <Submissions campaign={campaign} submissions={submissions} creator={data} />
          )}
          {currentTab === 'logistics' && <LogisticView campaign={campaign} creator={data} />}

          {currentTab === 'invoice' && invoice ? (
            <PDFViewer width="100%" height={600} style={{ border: 'none', borderRadius: 10 }}>
              <InvoicePDF invoice={invoice} />
            </PDFViewer>
          ) : null}

          {currentTab === 'invoice' && !invoice ? (
            <EmptyContent
              title="No invoice found"
              description="This creator has not been invoiced yet."
            />
          ) : null}

          {currentTab === 'timeline' && <TimelineCreator campaign={campaign} creator={data} />}
        </>
      )}
    </Container>
  );
};

export default CampaignManageCreatorView;

CampaignManageCreatorView.propTypes = {
  id: PropTypes.string,
  campaignId: PropTypes.string,
};
