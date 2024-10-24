/* eslint-disable jsx-a11y/media-has-caption */
import { mutate } from 'swr';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Paper,
  Alert,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';
import useSocketContext from 'src/socket/hooks/useSocketContext';

import Image from 'src/components/image';
import Label from 'src/components/label';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFUpload, RHFTextField } from 'src/components/hook-form';

const CampaignFirstDraft = ({
  campaign,
  timeline,
  submission,
  getDependency,
  fullSubmission,
  openLogisticTab,
}) => {
  // eslint-disable-next-line no-unused-vars
  const [preview, setPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dependency = getDependency(submission?.id);
  const { socket } = useSocketContext();
  const [progress, setProgress] = useState(0);
  const [progressName, setProgressName] = useState('');
  const display = useBoolean();
  const { user } = useAuthContext();

  const methods = useForm();

  const { handleSubmit, setValue, reset } = methods;

  const handleRemoveFile = () => {
    localStorage.removeItem('preview');
    setValue('draft', '');
    setPreview('');
  };

  const logistics = useMemo(
    () => campaign?.logistic?.filter((item) => item?.userId === user?.id),
    [campaign, user]
  );

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      // if (file.type !== 'video/mp4') {
      //   enqueueSnackbar(
      //     'Currently, only MP4 video format is supported. Please upload your video in MP4 format.',
      //     {
      //       variant: 'warning',
      //     }
      //   );
      //   return;
      // }

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      setPreview(newFile.preview);
      localStorage.setItem('preview', newFile.preview);

      if (file) {
        setValue('draft', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (value) => {
    setLoading(true);
    const formData = new FormData();
    const newData = { ...value, campaignId: campaign.id, submissionId: submission.id };
    formData.append('data', JSON.stringify(newData));
    formData.append('draftVideo', value.draft);
    try {
      const res = await axiosInstance.post(endpoints.submission.creator.draftSubmission, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      enqueueSnackbar(res.data.message);
      mutate(endpoints.kanban.root);
      mutate(endpoints.campaign.creator.getCampaign(campaign.id));
    } catch (error) {
      enqueueSnackbar('Failed to submit draft', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  });

  const previousSubmission = useMemo(
    () => fullSubmission?.find((item) => item?.id === dependency?.dependentSubmissionId),
    [fullSubmission, dependency]
  );

  useEffect(() => {
    if (socket) {
      socket?.on('progress', (data) => {
        if (submission?.id === data.submissionId) {
          setIsProcessing(true);
          setProgress(data.progress);
          setProgressName(data.name);

          if (data.progress === 100) {
            mutate(`${endpoints.submission.root}?creatorId=${user?.id}&campaignId=${campaign?.id}`);

            mutate(endpoints.kanban.root);
            setIsProcessing(false);
            reset();
            setProgressName('');
            setPreview('');
            localStorage.removeItem('preview');
          } else if (progress === 0) {
            setIsProcessing(false);
            reset();
            setPreview('');
            setProgressName('');
            localStorage.removeItem('preview');
          }
        }
      });
    }
    return () => {
      socket?.off('progress');
    };
  }, [socket, submission, reset, progress, campaign, user]);

  const handleCancel = () => {
    if (isProcessing) {
      socket?.emit('cancel-processing', { submissionId: submission.id });
      setIsProcessing(false);
      setProgress(0);
      localStorage.removeItem('preview');
    }
  };

  return (
    previousSubmission?.status === 'APPROVED' && (
      <Box>
        {logistics?.every((logistic) => logistic?.status === 'Product_has_been_received') ? (
          <Box>
            {submission?.status === 'PENDING_REVIEW' && (
              <Stack justifyContent="center" alignItems="center" spacing={2}>
                <Image src="/assets/pending.svg" sx={{ width: 250 }} />
                <Typography variant="subtitle2">Your First Draft is in review.</Typography>
                <Button onClick={display.onTrue}>Preview Draft</Button>
              </Stack>
            )}
            {submission?.status === 'IN_PROGRESS' && (
              <>
                {isProcessing ? (
                  <Stack justifyContent="center" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        thickness={5}
                        value={progress}
                        size={200}
                        sx={{
                          ' .MuiCircularProgress-circle': {
                            stroke: (theme) =>
                              theme.palette.mode === 'dark'
                                ? theme.palette.common.white
                                : theme.palette.common.black,
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h3" sx={{ fontWeight: 'bolder', fontSize: 11 }}>
                          {`${Math.round(progress)}%`}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack gap={1}>
                      <Typography variant="caption">{progressName && progressName}</Typography>
                      {/* <LinearProgress variant="determinate" value={progress} /> */}

                      <Button variant="contained" size="small" onClick={() => handleCancel()}>
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <FormProvider methods={methods} onSubmit={onSubmit}>
                    <Stack gap={2}>
                      {localStorage.getItem('preview') ? (
                        <Stack spacing={2} alignItems="center">
                          <Box
                            component="video"
                            autoPlay
                            controls
                            sx={{
                              maxHeight: '60vh',
                              width: { xs: '70vw', sm: 'auto' },
                              borderRadius: 2,
                            }}
                          >
                            <source src={localStorage.getItem('preview')} />
                          </Box>
                          {/* <video autoPlay controls width="100%" style={{ borderRadius: 10 }}>
                          </video> */}
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={handleRemoveFile}
                          >
                            Change Video
                          </Button>
                        </Stack>
                      ) : (
                        <RHFUpload
                          name="draft"
                          type="video"
                          onDrop={handleDrop}
                          onRemove={handleRemoveFile}
                        />
                      )}
                      <RHFTextField name="caption" placeholder="Caption" multiline />
                      <LoadingButton loading={loading} variant="contained" type="submit">
                        Submit Draft
                      </LoadingButton>
                    </Stack>
                  </FormProvider>
                )}
              </>
            )}
            {submission?.status === 'CHANGES_REQUIRED' && (
              <Stack spacing={2}>
                <Box textAlign="center">
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Box
                      component="video"
                      autoPlay
                      controls
                      sx={{
                        maxHeight: '60vh',
                        width: { xs: '70vw', sm: 'auto' },
                        borderRadius: 2,
                        boxShadow: 3,
                      }}
                    >
                      <source src={submission?.content} />
                    </Box>

                    <Box component={Paper} p={1.5} width={1}>
                      <Typography variant="caption" color="text.secondary">
                        Caption
                      </Typography>
                      <Typography variant="subtitle1">{submission?.caption}</Typography>
                    </Box>
                  </Box>

                  {/* {submission && (
                    <video autoPlay controls width="80%" style={{ borderRadius: 10 }}>
                      <source src={submission?.content} />
                    </video>
                  )}
                  <Box component={Paper} p={1} border={1}>
                    {submission?.caption}
                  </Box> */}
                </Box>
                <Alert severity="warning">
                  <Box display="flex" gap={1.5} flexDirection="column">
                    <Typography variant="subtitle2" sx={{ textDecoration: 'underline' }}>
                      Changes Required
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                      {submission?.feedback[0]?.reasons?.length &&
                        submission?.feedback[0]?.reasons?.map((item, index) => (
                          <Label key={index}>{item}</Label>
                        ))}
                    </Stack>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {submission?.feedback[0]?.content}
                    </Typography>
                  </Box>
                </Alert>
              </Stack>
            )}
            {submission?.status === 'APPROVED' && (
              <Stack justifyContent="center" alignItems="center" spacing={2}>
                <Image src="/assets/approve.svg" sx={{ width: 250 }} />
                <Typography variant="subtitle2">Your First Draft has been approved.</Typography>
                <Button onClick={display.onTrue} variant="outlined" size="small">
                  Preview Draft
                </Button>
              </Stack>
            )}
            <Dialog open={display.value} onClose={display.onFalse} fullWidth maxWidth="md">
              <DialogTitle>First Draft Video</DialogTitle>
              <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                  <Box
                    component="video"
                    autoPlay
                    controls
                    sx={{
                      maxHeight: '60vh',
                      width: { xs: '70vw', sm: 'auto' },
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                  >
                    <source src={submission?.content} />
                  </Box>

                  <Box component={Paper} p={1.5} width={1}>
                    <Typography variant="caption" color="text.secondary">
                      Caption
                    </Typography>
                    <Typography variant="subtitle1">{submission?.caption}</Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={display.onFalse}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        ) : (
          <Stack justifyContent="center" alignItems="center" spacing={1.5}>
            <Image src="/assets/pending_delivery.svg" sx={{ width: 250 }} />

            <ListItemText
              primary="Your item has been shipped."
              secondary="You can start submit your first draft after you receive the item."
              primaryTypographyProps={{
                variant: 'subtitle2',
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary',
              }}
            />

            <Button size="small" variant="outlined" onClick={openLogisticTab}>
              Check Logistic
            </Button>

            {/* <Typography variant="subtitle2">
              Your item has been shipped and pending delivery confirmation.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You can start submit your first draft submission after you receive the item.
            </Typography> */}
          </Stack>
        )}
      </Box>
    )
  );
};

export default CampaignFirstDraft;

CampaignFirstDraft.propTypes = {
  campaign: PropTypes.object,
  timeline: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  submission: PropTypes.object,
  getDependency: PropTypes.func,
  fullSubmission: PropTypes.array,
  openLogisticTab: PropTypes.func,
};
