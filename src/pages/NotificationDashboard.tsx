import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './NotificationDashboard.module.css';
import notificationService, {
  MarketingHealth,
  MarketingRunSummary,
  MarketingContact,
  MarketingPagination,
  FresherSubscriber,
} from '../services/notificationService';
import {
  notificationAdminAPI,
  type NotificationLogEntry,
  type NotificationCsvSummary,
  type FresherNotificationJob,
} from '../services/api';

const ADMIN_KEY_STORAGE = 'mcbAdminKey';
const MARKETING_PAGE_SIZE = 10;
const SUBSCRIBER_PAGE_SIZE = 10;

interface ContactFormState {
  fullName: string;
  email: string;
  mobileNo: string;
  branch: string;
  experience: string;
}

const createEmptyContactForm = (): ContactFormState => ({
  fullName: '',
  email: '',
  mobileNo: '',
  branch: '',
  experience: '',
});

const createDefaultContactPagination = (): MarketingPagination => ({
  page: 1,
  pageSize: MARKETING_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

const createDefaultSubscriberPagination = (): MarketingPagination => ({
  page: 1,
  pageSize: SUBSCRIBER_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};

const NotificationDashboard: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>('');
  const [adminKeyInput, setAdminKeyInput] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);

  const [jobs, setJobs] = useState<FresherNotificationJob[]>([]);
  const [logs, setLogs] = useState<{ success: NotificationLogEntry[]; failed: NotificationLogEntry[] }>({
    success: [],
    failed: [],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvSummary, setCsvSummary] = useState<NotificationCsvSummary | null>(null);
  const [marketingHealth, setMarketingHealth] = useState<MarketingHealth | null>(null);
  const [marketingRunSummary, setMarketingRunSummary] = useState<MarketingRunSummary | null>(null);
  const [marketingContacts, setMarketingContacts] = useState<MarketingContact[]>([]);
  const [marketingPagination, setMarketingPagination] = useState<MarketingPagination>(createDefaultContactPagination);
  const [marketingPage, setMarketingPage] = useState<number>(1);
  const [marketingSearchInput, setMarketingSearchInput] = useState<string>('');
  const [marketingSearch, setMarketingSearch] = useState<string>('');
  const [isLoadingMarketingContacts, setIsLoadingMarketingContacts] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(createEmptyContactForm);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<FresherSubscriber[]>([]);
  const [subscriberPagination, setSubscriberPagination] = useState<MarketingPagination>(createDefaultSubscriberPagination);
  const [subscriberPage, setSubscriberPage] = useState<number>(1);
  const [subscriberSearchInput, setSubscriberSearchInput] = useState<string>('');
  const [subscriberSearch, setSubscriberSearch] = useState<string>('');
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (storedKey) {
      setAdminKey(storedKey);
      setAdminKeyInput(storedKey);
    }
  }, []);

  const clearState = useCallback(() => {
    setJobs([]);
    setLogs({ success: [], failed: [] });
    setSelectedFile(null);
    setCsvSummary(null);
    setMarketingHealth(null);
    setMarketingRunSummary(null);
    setMarketingContacts([]);
    setMarketingPagination(createDefaultContactPagination());
    setMarketingPage(1);
    setMarketingSearch('');
    setMarketingSearchInput('');
    setContactForm(createEmptyContactForm());
    setEditingContactId(null);
    setIsSavingContact(false);
    setDeletingContactId(null);
    setIsLoadingMarketingContacts(false);
    setSubscribers([]);
    setSubscriberPagination(createDefaultSubscriberPagination());
    setSubscriberPage(1);
    setSubscriberSearch('');
    setSubscriberSearchInput('');
    setIsLoadingSubscribers(false);
  }, []);

  const resetMessages = useCallback(() => {
    setStatusMessage('');
    setErrorMessage('');
  }, []);

  const clearStoredAdminKey = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey('');
    setAdminKeyInput('');
    clearState();
  }, [clearState]);

  const handleAdminError = useCallback(
    (message?: string) => {
    const normalized = message || 'Failed to process request';
    setErrorMessage(normalized);
    if (normalized.toLowerCase().includes('admin key')) {
      clearStoredAdminKey();
    }
    },
    [clearStoredAdminKey]
  );

  const loadJobs = useCallback(
    async (overrideKey?: string) => {
    const keyToUse = (overrideKey ?? adminKey)?.trim();
    if (!keyToUse) {
      setJobs([]);
      return;
    }

    setIsLoadingJobs(true);
    try {
      const response = await notificationAdminAPI.fetchFresherJobs({
        adminKey: keyToUse,
        includeNotified: true,
      });
        setJobs(response.data?.jobs || []);
      if (response.message) {
        setStatusMessage(response.message);
      }
    } catch (error: any) {
      handleAdminError(error?.message);
    } finally {
      setIsLoadingJobs(false);
    }
    },
    [adminKey, handleAdminError]
  );

  const loadLogs = useCallback(
    async (overrideKey?: string) => {
    const keyToUse = (overrideKey ?? adminKey)?.trim();
    if (!keyToUse) {
      setLogs({ success: [], failed: [] });
      return;
    }

    setIsLoadingLogs(true);
    try {
        const response = await notificationAdminAPI.fetchLogs(keyToUse, 50);
      setLogs(response.data || { success: [], failed: [] });
    } catch (error: any) {
      handleAdminError(error?.message);
    } finally {
      setIsLoadingLogs(false);
    }
    },
    [adminKey, handleAdminError]
  );

  const loadMarketingHealth = useCallback(
    async (overrideKey?: string) => {
      const keyToUse = (overrideKey ?? adminKey)?.trim();
      if (!keyToUse) {
        setMarketingHealth(null);
        return;
      }

      try {
        const response = await notificationService.fetchMarketingHealth(keyToUse);
        if (response.success && response.data) {
          const data = response.data;
          setMarketingHealth({
            lastRunAt: data.last_run_at ?? null,
            lastBatchId: data.last_batch_id ?? null,
            pendingJobsCount: data.pending_jobs_count ?? 0,
            failureRate24h: data.failure_rate_24h ?? 0,
            runs24h: data.runs_24h ?? 0,
            failures24h: data.failures_24h ?? 0,
          });
        }
      } catch (error) {
        console.error('Failed to load marketing health', error);
      }
    },
    [adminKey]
  );

  const loadMarketingContacts = useCallback(
    async (overrideKey?: string, overrides: { page?: number; search?: string } = {}) => {
    const keyToUse = (overrideKey ?? adminKey)?.trim();
    if (!keyToUse) {
      setMarketingContacts([]);
        setMarketingPagination(createDefaultContactPagination());
      return;
    }

      const targetPage = overrides.page ?? marketingPage;
    const searchValue = overrides.search ?? marketingSearch;

    setIsLoadingMarketingContacts(true);
    try {
      const response = await notificationService.fetchMarketingContacts({
        adminKey: keyToUse,
        page: targetPage,
          pageSize: MARKETING_PAGE_SIZE,
          search: searchValue || undefined,
        });

        const payload = response.data || {
          contacts: [],
          pagination: createDefaultContactPagination(),
        };

      setMarketingContacts(payload.contacts || []);
        if (payload.pagination) {
          setMarketingPagination(payload.pagination);
          if (payload.pagination.page && payload.pagination.page !== marketingPage) {
            setMarketingPage(payload.pagination.page);
          }
        } else {
          const fallbackPagination: MarketingPagination = {
            page: targetPage,
            pageSize: MARKETING_PAGE_SIZE,
            total: payload.contacts?.length ?? 0,
            totalPages: payload.contacts && payload.contacts.length > 0 ? 1 : 0,
            hasNextPage: false,
            hasPrevPage: targetPage > 1,
          };
          setMarketingPagination(fallbackPagination);
        }
    } catch (error: any) {
        handleAdminError(error?.message || 'Failed to load marketing contacts');
    } finally {
      setIsLoadingMarketingContacts(false);
    }
    },
    [adminKey, marketingPage, marketingSearch, handleAdminError]
  );

  const loadSubscribers = useCallback(
    async (overrideKey?: string, overrides: { page?: number; search?: string } = {}) => {
    const keyToUse = (overrideKey ?? adminKey)?.trim();
    if (!keyToUse) {
        setSubscribers([]);
        setSubscriberPagination(createDefaultSubscriberPagination());
      return;
    }

      const targetPage = overrides.page ?? subscriberPage;
      const searchValue = overrides.search ?? subscriberSearch;

      setIsLoadingSubscribers(true);
      try {
        const response = await notificationService.fetchFresherSubscribers({
          adminKey: keyToUse,
          page: targetPage,
          pageSize: SUBSCRIBER_PAGE_SIZE,
          search: searchValue || undefined,
        });

        const payload = response.data || {
          subscribers: [],
          pagination: createDefaultSubscriberPagination(),
        };

        setSubscribers(payload.subscribers || []);
        if (payload.pagination) {
          setSubscriberPagination(payload.pagination);
          if (payload.pagination.page && payload.pagination.page !== subscriberPage) {
            setSubscriberPage(payload.pagination.page);
          }
        } else {
          const fallbackPagination: MarketingPagination = {
            page: targetPage,
            pageSize: SUBSCRIBER_PAGE_SIZE,
            total: payload.subscribers?.length ?? 0,
            totalPages: payload.subscribers && payload.subscribers.length > 0 ? 1 : 0,
            hasNextPage: false,
            hasPrevPage: targetPage > 1,
          };
          setSubscriberPagination(fallbackPagination);
        }
      } catch (error: any) {
        handleAdminError(error?.message || 'Failed to load subscribers');
      } finally {
        setIsLoadingSubscribers(false);
      }
    },
    [adminKey, subscriberPage, subscriberSearch, handleAdminError]
  );

  useEffect(() => {
    if (!adminKey.trim()) {
      return;
    }
    loadMarketingContacts(undefined, { page: marketingPage, search: marketingSearch });
  }, [adminKey, marketingPage, marketingSearch, loadMarketingContacts]);

  useEffect(() => {
    if (!adminKey.trim()) {
      return;
    }
    loadSubscribers(undefined, { page: subscriberPage, search: subscriberSearch });
  }, [adminKey, subscriberPage, subscriberSearch, loadSubscribers]);

  const handleAdminSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();
      const trimmedKey = adminKeyInput.trim();
      if (!trimmedKey) {
        handleAdminError('Please enter the admin key.');
        return;
      }
      setAdminKey(trimmedKey);
      setShowKeyInput(false);
      localStorage.setItem(ADMIN_KEY_STORAGE, trimmedKey);
      setMarketingPage(1);
      setMarketingSearch('');
      setMarketingSearchInput('');
      setSubscriberPage(1);
      setSubscriberSearch('');
      setSubscriberSearchInput('');
      await Promise.all([
        loadJobs(trimmedKey),
        loadLogs(trimmedKey),
        loadMarketingHealth(trimmedKey),
        loadMarketingContacts(trimmedKey, { page: 1, search: '' }),
        loadSubscribers(trimmedKey, { page: 1, search: '' }),
      ]);
    },
    [
      adminKeyInput,
      handleAdminError,
      loadJobs,
      loadLogs,
      loadMarketingHealth,
      loadMarketingContacts,
      loadSubscribers,
      resetMessages,
    ]
  );

  const handleClearAdminKey = useCallback(() => {
    resetMessages();
    setShowKeyInput(true);
    clearStoredAdminKey();
  }, [clearStoredAdminKey, resetMessages]);

  const handleContactInputChange = useCallback(
    (field: keyof ContactFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setContactForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleContactSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();

      const key = adminKey.trim();
      if (!key) {
        handleAdminError('Enter the admin key before managing contacts.');
        return;
      }

      const payload = {
        fullName: contactForm.fullName.trim(),
        email: contactForm.email.trim(),
        mobileNo: contactForm.mobileNo.trim(),
        branch: contactForm.branch.trim(),
        experience: contactForm.experience.trim(),
      };

      if (!payload.fullName) {
        handleAdminError('Contact full name is required.');
        return;
      }
      if (!payload.email) {
        handleAdminError('Contact email is required.');
        return;
      }

      setIsSavingContact(true);
      try {
        if (editingContactId) {
          await notificationService.updateMarketingContact({
            adminKey: key,
            contactId: editingContactId,
            payload,
          });
          setStatusMessage('Marketing contact updated.');
          await loadMarketingContacts(undefined, { page: marketingPage, search: marketingSearch });
        } else {
          await notificationService.createMarketingContact({
            adminKey: key,
            payload,
          });
          setStatusMessage('Marketing contact created.');
          if (marketingPage !== 1) {
            setMarketingPage(1);
          }
          await loadMarketingContacts(undefined, { page: 1, search: marketingSearch });
        }
        setContactForm(createEmptyContactForm());
        setEditingContactId(null);
      } catch (error: any) {
        handleAdminError(error?.message || 'Failed to save marketing contact');
      } finally {
        setIsSavingContact(false);
      }
    },
    [
      adminKey,
      contactForm,
      editingContactId,
      handleAdminError,
      loadMarketingContacts,
      marketingPage,
      marketingSearch,
      resetMessages,
    ]
  );

  const handleEditContact = useCallback(
    (contact: MarketingContact) => {
      resetMessages();
      setEditingContactId(contact.id);
      setContactForm({
        fullName: contact.fullName,
        email: contact.email,
        mobileNo: contact.mobileNo ?? '',
        branch: contact.branch ?? '',
        experience: contact.experience ?? '',
      });
    },
    [resetMessages]
  );

  const handleCancelEditContact = useCallback(() => {
    resetMessages();
    setEditingContactId(null);
    setContactForm(createEmptyContactForm());
  }, [resetMessages]);

  const handleDeleteContact = useCallback(
    async (contactId: number) => {
      const key = adminKey.trim();
      if (!key) {
        handleAdminError('Enter the admin key before managing contacts.');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this marketing contact?')) {
        return;
      }

      setDeletingContactId(contactId);
      resetMessages();

      try {
        await notificationService.deleteMarketingContact({
          adminKey: key,
          contactId,
        });
        setStatusMessage('Marketing contact deleted.');

        if (marketingContacts.length <= 1 && marketingPage > 1) {
          setMarketingPage((prev) => Math.max(prev - 1, 1));
        } else {
          await loadMarketingContacts(undefined, { page: marketingPage, search: marketingSearch });
        }
      } catch (error: any) {
        handleAdminError(error?.message || 'Failed to delete marketing contact');
      } finally {
        setDeletingContactId(null);
      }
    },
    [
      adminKey,
      handleAdminError,
      loadMarketingContacts,
      marketingContacts.length,
      marketingPage,
      marketingSearch,
      resetMessages,
    ]
  );

  const handleContactSearchSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();
      const key = adminKey.trim();
      if (!key) {
        handleAdminError('Enter the admin key before managing contacts.');
        return;
      }

      const searchValue = marketingSearchInput.trim();
      setMarketingSearch(searchValue);
      setMarketingPage(1);
      await loadMarketingContacts(undefined, { page: 1, search: searchValue });
    },
    [adminKey, handleAdminError, loadMarketingContacts, marketingSearchInput, resetMessages]
  );

  const handleClearContactSearch = useCallback(async () => {
    if (!marketingSearch && marketingSearchInput === '') {
      return;
    }
    resetMessages();
    setMarketingSearchInput('');
    setMarketingSearch('');
    setMarketingPage(1);
    if (adminKey.trim()) {
      await loadMarketingContacts(undefined, { page: 1, search: '' });
    }
  }, [adminKey, loadMarketingContacts, marketingSearch, marketingSearchInput, resetMessages]);

  const handleNextContactsPage = useCallback(() => {
    if (!marketingPagination.hasNextPage) {
      return;
    }
    setMarketingPage((prev) => prev + 1);
  }, [marketingPagination.hasNextPage]);

  const handlePrevContactsPage = useCallback(() => {
    if (!marketingPagination.hasPrevPage) {
      return;
    }
    setMarketingPage((prev) => Math.max(prev - 1, 1));
  }, [marketingPagination.hasPrevPage]);

  const handleRefreshContacts = useCallback(async () => {
    const key = adminKey.trim();
    if (!key) {
      handleAdminError('Enter the admin key before managing contacts.');
      return;
    }
    resetMessages();
    await loadMarketingContacts(undefined, { page: marketingPage, search: marketingSearch });
  }, [adminKey, handleAdminError, loadMarketingContacts, marketingPage, marketingSearch, resetMessages]);

  const handleSubscriberSearchSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();
      const key = adminKey.trim();
      if (!key) {
        handleAdminError('Enter the admin key before managing subscribers.');
        return;
      }

      const searchValue = subscriberSearchInput.trim();
      setSubscriberSearch(searchValue);
      setSubscriberPage(1);
      await loadSubscribers(undefined, { page: 1, search: searchValue });
    },
    [adminKey, handleAdminError, loadSubscribers, subscriberSearchInput, resetMessages]
  );

  const handleClearSubscriberSearch = useCallback(async () => {
    if (!subscriberSearch && subscriberSearchInput === '') {
      return;
    }
    resetMessages();
    setSubscriberSearchInput('');
    setSubscriberSearch('');
    setSubscriberPage(1);
    if (adminKey.trim()) {
      await loadSubscribers(undefined, { page: 1, search: '' });
    }
  }, [adminKey, loadSubscribers, subscriberSearch, subscriberSearchInput, resetMessages]);

  const handleNextSubscribersPage = useCallback(() => {
    if (!subscriberPagination.hasNextPage) {
      return;
    }
    setSubscriberPage((prev) => prev + 1);
  }, [subscriberPagination.hasNextPage]);

  const handlePrevSubscribersPage = useCallback(() => {
    if (!subscriberPagination.hasPrevPage) {
      return;
    }
    setSubscriberPage((prev) => Math.max(prev - 1, 1));
  }, [subscriberPagination.hasPrevPage]);

  const handleRefreshSubscribers = useCallback(async () => {
    const key = adminKey.trim();
    if (!key) {
      handleAdminError('Enter the admin key before managing subscribers.');
      return;
    }
    resetMessages();
    await loadSubscribers(undefined, { page: subscriberPage, search: subscriberSearch });
  }, [adminKey, handleAdminError, loadSubscribers, subscriberPage, subscriberSearch, resetMessages]);

  const marketingStatsCards = useMemo(() => {
    if (!marketingHealth) {
      return [
        { label: 'Pending Jobs', value: '-', subtext: 'Awaiting marketing digest' },
        { label: 'Last Run', value: '-', subtext: 'No data yet' },
        { label: 'Failure Rate (24h)', value: '-', subtext: 'Monitor delivery health' },
        { label: 'Runs (24h)', value: '-', subtext: 'Success / total' },
      ];
    }

    const failureRate = `${marketingHealth.failureRate24h.toFixed(2)}%`;
    const runRatio = `${marketingHealth.runs24h - marketingHealth.failures24h}/${marketingHealth.runs24h}`;

    return [
      {
        label: 'Pending Jobs',
        value: marketingHealth.pendingJobsCount,
        subtext: 'Awaiting marketing digest',
      },
      {
        label: 'Last Run',
        value: formatDateTime(marketingHealth.lastRunAt),
        subtext: marketingHealth.lastBatchId ? `Batch ${marketingHealth.lastBatchId}` : 'No batch id yet',
      },
      {
        label: 'Failure Rate (24h)',
        value: failureRate,
        subtext: 'Monitor delivery health',
      },
      {
        label: 'Runs (24h)',
        value: runRatio,
        subtext: `${marketingHealth.failures24h} failures`,
      },
    ];
  }, [marketingHealth]);

  const hasAdminKey = adminKey.trim().length > 0;
  
  return (
    <div className={styles.container}>
      {showKeyInput ? (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Admin Access</h2>
          <form onSubmit={handleAdminSubmit} className={styles.form}>
            <input
              type="password"
              value={adminKeyInput}
              onChange={(event) => setAdminKeyInput(event.target.value)}
              placeholder="Enter Admin Key"
              className={styles.textInput}
              autoFocus
            />
            <button type="submit" className={styles.button}>
              Access Dashboard
            </button>
          </form>
          {errorMessage && <div className={styles.messageError}>{errorMessage}</div>}
        </div>
      ) : (
        <>
          <div className={styles.actionsRow}>
            <button onClick={handleClearAdminKey} className={styles.buttonMuted}>
              Reset Admin Key
            </button>
          </div>
          
          <div className={styles.cardGrid}>
            {marketingStatsCards.map((card, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardLabel}>{card.label}</div>
                <div className={styles.cardValue}>{card.value}</div>
                <div className={styles.cardSubtext}>{card.subtext}</div>
              </div>
            ))}
          </div>

          {statusMessage && <div className={styles.messageSuccess}>{statusMessage}</div>}
          {errorMessage && <div className={styles.messageError}>{errorMessage}</div>}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Upload Subscriber CSV</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
              if (!selectedFile) {
                handleAdminError('Please choose a CSV file that contains name and email columns.');
                return;
              }

              setIsUploading(true);
              resetMessages();
              try {
                  const response = await notificationAdminAPI.uploadSubscribersCsv(selectedFile, adminKey);
                setCsvSummary(response.data || null);
                  setStatusMessage(response.message || 'Subscriber list processed successfully.');

                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setSelectedFile(null);

                  await Promise.all([loadJobs(adminKey), loadLogs(adminKey)]);
              } catch (error: any) {
                handleAdminError(error?.message || 'Failed to upload subscriber CSV');
              } finally {
                setIsUploading(false);
              }
              }}
              className={styles.form}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(event) => {
                  resetMessages();
                  const file = event.target.files && event.target.files[0];
                  setSelectedFile(file || null);
                  setCsvSummary(null);
                }}
                className={styles.fileInput}
              />
              <button type="submit" className={styles.button} disabled={isUploading}>
                {isUploading ? 'Uploading…' : 'Upload CSV'}
              </button>
              {selectedFile && <span className={styles.helperText}>{selectedFile.name}</span>}
            </form>

            {csvSummary && (
              <div className={styles.list}>
                <h3>Upload Summary</h3>
                <div>Processed rows: {csvSummary.processed}</div>
                <div>Inserted: {csvSummary.inserted}</div>
                <div>Updated: {csvSummary.updated}</div>
                <div>Skipped: {csvSummary.skipped}</div>
                {csvSummary.errors?.length ? (
                  <details>
                    <summary>{csvSummary.errors.length} issue(s)</summary>
                    <div className={styles.codeBlock}>
                      {csvSummary.errors
                        .slice(0, 10)
                        .map((entry, index) => `Row ${entry.row}: ${entry.email || 'unknown'} — ${entry.message}`)
                        .join('\n')}
                      {csvSummary.errors.length > 10 && '\n…'}
                    </div>
                  </details>
                ) : null}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Trigger Marketing Digest</h2>
            <div className={styles.actionsRow}>
              <button 
                onClick={async () => {
                  setIsSending(true);
                  resetMessages();
                  try {
                    const response = await notificationService.triggerMarketingDigest({
                      adminKey,
                      force: true,
                    });

                    if (response.success) {
                      setMarketingRunSummary(response.data || null);
                      setStatusMessage(response.message || 'Marketing digest triggered successfully.');
                    }

                    await Promise.all([loadMarketingHealth(adminKey), loadLogs(adminKey), loadJobs(adminKey)]);
                  } catch (error: any) {
                    handleAdminError(error?.message || 'Failed to trigger marketing digest');
                  } finally {
                    setIsSending(false);
                  }
                }}
                className={styles.button}
                disabled={isSending}
              >
                {isSending ? 'Sending…' : 'Send Digest Now'}
              </button>
            </div>

            {marketingRunSummary && (
              <div className={styles.list}>
                <h3>Last Run Summary</h3>
                <div>Status: {marketingRunSummary.ok ? 'Success' : marketingRunSummary.skipped ? 'Skipped' : 'Completed with issues'}</div>
                <div>Batch ID: {marketingRunSummary.batchId}</div>
                <div>Jobs queried: {marketingRunSummary.jobsQueried}</div>
                <div>Jobs included: {marketingRunSummary.jobsIncluded}</div>
                <div>Contacts attempted: {marketingRunSummary.contactsAttempted}</div>
                <div>Contacts succeeded: {marketingRunSummary.contactsSucceeded}</div>
                <div>Contacts failed: {marketingRunSummary.contactsFailed}</div>
                <div>Started: {formatDateTime(marketingRunSummary.startedAt)}</div>
                <div>Finished: {formatDateTime(marketingRunSummary.finishedAt)}</div>
                {marketingRunSummary.reason && <div>Reason: {marketingRunSummary.reason}</div>}
                {marketingRunSummary.errors && marketingRunSummary.errors.length > 0 && (
                  <details>
                    <summary>View errors ({marketingRunSummary.errors.length})</summary>
                    <div className={styles.codeBlock}>
                      {marketingRunSummary.errors
                        .map((entry, index) => `${index + 1}. ${typeof entry === 'string' ? entry : JSON.stringify(entry)}`)
                        .join('\n')}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fresher Notification Subscribers</h2>
            {!hasAdminKey ? (
              <p>Please enter the admin key to view subscribers.</p>
            ) : (
              <>
                <form className={styles.form} onSubmit={handleSubscriberSearchSubmit}>
                  <input
                    type="text"
                    value={subscriberSearchInput}
                    onChange={(event) => setSubscriberSearchInput(event.target.value)}
                    placeholder="Search subscribers by name or email..."
                    className={styles.textInput}
                  />
                  <button type="submit" className={styles.buttonGhost} disabled={isLoadingSubscribers}>
                    Search
                  </button>
                  {(subscriberSearch || subscriberSearchInput) && (
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handleClearSubscriberSearch}
                      disabled={isLoadingSubscribers}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={handleRefreshSubscribers}
                    disabled={isLoadingSubscribers}
                  >
                    Refresh
                  </button>
                </form>

                {isLoadingSubscribers ? (
                  <p>Loading subscribers…</p>
                ) : subscribers.length === 0 ? (
                  <p>No subscribers found.</p>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.tableHeader}>Full name</th>
                          <th className={styles.tableHeader}>Email</th>
                          <th className={styles.tableHeader}>Mobile</th>
                          <th className={styles.tableHeader}>Branch</th>
                          <th className={styles.tableHeader}>Experience</th>
                          <th className={styles.tableHeader}>Subscribed At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id}>
                            <td className={styles.tableCell}>{subscriber.fullName || 'Subscriber'}</td>
                            <td className={styles.tableCell}>{subscriber.email}</td>
                            <td className={styles.tableCell}>{subscriber.mobileNo || '—'}</td>
                            <td className={styles.tableCell}>{subscriber.branch || '—'}</td>
                            <td className={styles.tableCell}>{subscriber.experience || '—'}</td>
                            <td className={styles.tableCell}>{formatDateTime(subscriber.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className={styles.actionsRow}>
                  <span className={styles.helperText}>
                    {subscriberPagination.total > 0
                      ? `Page ${subscriberPagination.page} of ${Math.max(subscriberPagination.totalPages, 1)} • Total subscribers: ${subscriberPagination.total}`
                      : 'No subscribers available'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handlePrevSubscribersPage}
                      disabled={!subscriberPagination.hasPrevPage || isLoadingSubscribers}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handleNextSubscribersPage}
                      disabled={!subscriberPagination.hasNextPage || isLoadingSubscribers}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Marketing Contacts</h2>
            {!hasAdminKey ? (
              <p>Please enter the admin key to manage marketing contacts.</p>
            ) : (
              <>
                <form className={styles.form} onSubmit={handleContactSubmit}>
                  <input
                    type="text"
                    value={contactForm.fullName}
                    onChange={handleContactInputChange('fullName')}
                    placeholder="Full name"
                    className={styles.textInput}
                    required
                  />
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactInputChange('email')}
                    placeholder="Email address"
                    className={styles.textInput}
                    required
                  />
                  <input
                    type="text"
                    value={contactForm.mobileNo}
                    onChange={handleContactInputChange('mobileNo')}
                    placeholder="Mobile number (optional)"
                    className={styles.textInput}
                  />
                  <input
                    type="text"
                    value={contactForm.branch}
                    onChange={handleContactInputChange('branch')}
                    placeholder="Branch (optional)"
                    className={styles.textInput}
                  />
                  <input
                    type="text"
                    value={contactForm.experience}
                    onChange={handleContactInputChange('experience')}
                    placeholder="Experience (optional)"
                    className={styles.textInput}
                  />
                  <button type="submit" className={styles.button} disabled={isSavingContact}>
                    {editingContactId ? (isSavingContact ? 'Updating…' : 'Update contact') : isSavingContact ? 'Saving…' : 'Add contact'}
                  </button>
                  {editingContactId && (
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handleCancelEditContact}
                      disabled={isSavingContact}
                    >
                      Cancel
                    </button>
                  )}
                </form>

                <form className={styles.form} onSubmit={handleContactSearchSubmit}>
                  <input
                    type="text"
                    value={marketingSearchInput}
                    onChange={(event) => setMarketingSearchInput(event.target.value)}
                    placeholder="Search contacts..."
                    className={styles.textInput}
                  />
                  <button type="submit" className={styles.buttonGhost} disabled={isLoadingMarketingContacts}>
                    Search
                  </button>
                  {(marketingSearch || marketingSearchInput) && (
                  <button 
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handleClearContactSearch}
                      disabled={isLoadingMarketingContacts}
                    >
                      Clear
                  </button>
                  )}
                  <button
                    type="button"
                    className={styles.buttonGhost}
                    onClick={handleRefreshContacts}
                    disabled={isLoadingMarketingContacts}
                  >
                    Refresh
                  </button>
                </form>

                {isLoadingMarketingContacts ? (
                  <p>Loading marketing contacts…</p>
                ) : marketingContacts.length === 0 ? (
                  <p>No marketing contacts found.</p>
                ) : (
                  <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>Name</th>
                      <th className={styles.tableHeader}>Email</th>
                          <th className={styles.tableHeader}>Mobile</th>
                          <th className={styles.tableHeader}>Branch</th>
                          <th className={styles.tableHeader}>Experience</th>
                          <th className={styles.tableHeader}>Created</th>
                          <th className={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketingContacts.map((contact) => (
                      <tr key={contact.id}>
                            <td className={styles.tableCell}>{contact.fullName}</td>
                        <td className={styles.tableCell}>{contact.email}</td>
                            <td className={styles.tableCell}>{contact.mobileNo || '—'}</td>
                            <td className={styles.tableCell}>{contact.branch || '—'}</td>
                            <td className={styles.tableCell}>{contact.experience || '—'}</td>
                            <td className={styles.tableCell}>{formatDateTime(contact.createdAt)}</td>
                        <td className={styles.tableCell}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className={styles.buttonGhost}
                                  onClick={() => handleEditContact(contact)}
                                  disabled={isSavingContact && editingContactId === contact.id}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  style={{
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 14px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    opacity: deletingContactId === contact.id ? 0.7 : 1,
                                  }}
                                  onClick={() => handleDeleteContact(contact.id)}
                                  disabled={deletingContactId === contact.id}
                                >
                                  {deletingContactId === contact.id ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                )}

                <div className={styles.actionsRow}>
                  <span className={styles.helperText}>
                    {marketingPagination.total > 0
                      ? `Page ${marketingPagination.page} of ${Math.max(marketingPagination.totalPages, 1)} • Total contacts: ${marketingPagination.total}`
                      : 'No contacts available'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handlePrevContactsPage}
                      disabled={!marketingPagination.hasPrevPage || isLoadingMarketingContacts}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className={styles.buttonGhost}
                      onClick={handleNextContactsPage}
                      disabled={!marketingPagination.hasNextPage || isLoadingMarketingContacts}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fresher Jobs Queue</h2>
            {!hasAdminKey ? (
              <p>Please enter the admin key to load jobs.</p>
            ) : isLoadingJobs ? (
              <p>Loading fresher jobs…</p>
            ) : jobs.length === 0 ? (
              <p>No fresher jobs found.</p>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>Title</th>
                      <th className={styles.tableHeader}>Company</th>
                      <th className={styles.tableHeader}>Location</th>
                      <th className={styles.tableHeader}>Experience</th>
                      <th className={styles.tableHeader}>Created</th>
                      <th className={styles.tableHeader}>Notified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className={styles.tableCell}>{job.title}</td>
                        <td className={styles.tableCell}>{job.company || '—'}</td>
                        <td className={styles.tableCell}>{job.location || '—'}</td>
                        <td className={styles.tableCell}>{job.experience || '—'}</td>
                        <td className={styles.tableCell}>{formatDateTime(job.createdAt)}</td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.badge} ${Number(job.notifySent) === 1 ? styles.badgeSuccess : styles.badgeWarning}`}>
                            {Number(job.notifySent) === 1 ? 'Sent' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.actionsRow}>
              <h2 className={styles.sectionTitle}>Recent Notification Logs</h2>
              <button
                onClick={() => loadLogs()}
                className={styles.buttonGhost}
                disabled={!hasAdminKey || isLoadingLogs}
              >
                {isLoadingLogs ? 'Refreshing…' : 'Refresh logs'}
              </button>
            </div>

            {!hasAdminKey ? (
              <p>Please enter the admin key to view logs.</p>
            ) : (
              <div className={styles.logColumns}>
                <div>
                  <h3 className={styles.logTitle}>Successful deliveries</h3>
                  {logs.success?.length ? (
                    <div className={styles.logList}>
                      {logs.success.map((entry, index) => (
                        <div key={`success-${index}`} className={styles.logSuccess}>
                          <div className={styles.logTimestamp}>{entry.timestamp || 'Unknown time'}</div>
                          <div className={styles.logStatus}>{entry.status}</div>
                          {entry.meta && (
                            <div className={styles.logMeta}>{typeof entry.meta === 'string' ? entry.meta : JSON.stringify(entry.meta)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No success logs yet.</p>
                  )}
                </div>

                <div>
                  <h3 className={styles.logTitle}>Failures & warnings</h3>
                  {logs.failed?.length ? (
                    <div className={styles.logList}>
                      {logs.failed.map((entry, index) => (
                        <div key={`failed-${index}`} className={styles.logFailure}>
                          <div className={styles.logTimestamp}>{entry.timestamp || 'Unknown time'}</div>
                          <div className={styles.logStatus}>{entry.status}</div>
                          {entry.meta && (
                            <div className={styles.logMeta}>{typeof entry.meta === 'string' ? entry.meta : JSON.stringify(entry.meta)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.mutedText}>No failure logs captured.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDashboard;