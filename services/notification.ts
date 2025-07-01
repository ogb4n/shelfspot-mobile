import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

class NotificationService {
  private token: string | null = null;

  constructor() {
    // Configure how notifications are handled when the app is in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      // Check if this is a physical device
      if (!Device.isDevice) {
        console.warn('NotificationService: Push notifications only work on physical devices');
        return {
          granted: false,
          canAskAgain: false,
          status: 'denied' as Notifications.PermissionStatus,
        };
      }

      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If not granted, ask for permission
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const result: NotificationPermissionStatus = {
        granted: finalStatus === 'granted',
        canAskAgain: finalStatus !== 'denied',
        status: finalStatus,
      };

      console.log('NotificationService: Permission status:', result);
      return result;
    } catch (error) {
      console.error('NotificationService: Error requesting permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as Notifications.PermissionStatus,
      };
    }
  }

  /**
   * Get the device's push notification token
   */
  async getNotificationToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('NotificationService: Cannot get push token on simulator');
        return null;
      }

      // Get the token with explicit project configuration
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '02b90de8-c6d5-427a-aac8-5298cb275fc9', // From app.json extra.eas.projectId
      });

      this.token = token.data;
      console.log('NotificationService: Push token obtained:', this.token);
      return this.token;
    } catch (error) {
      console.error('NotificationService: Error getting push token:', error);
      return null;
    }
  }

  /**
   * Get the cached token without making a new request
   */
  getCachedToken(): string | null {
    return this.token;
  }

  /**
   * Register for push notifications and get token
   * This is the main method to call after user authentication
   */
  async registerForPushNotifications(): Promise<{
    success: boolean;
    token: string | null;
    permissionStatus: NotificationPermissionStatus;
  }> {
    try {
      console.log('NotificationService: Starting push notification registration');

      // Step 1: Request permissions
      const permissionStatus = await this.requestPermissions();
      
      if (!permissionStatus.granted) {
        console.log('NotificationService: Permissions not granted');
        return {
          success: false,
          token: null,
          permissionStatus,
        };
      }

      // Step 2: Get the token
      const token = await this.getNotificationToken();
      
      if (!token) {
        console.log('NotificationService: Could not obtain push token');
        return {
          success: false,
          token: null,
          permissionStatus,
        };
      }

      console.log('NotificationService: Push notification registration successful');
      return {
        success: true,
        token,
        permissionStatus,
      };
    } catch (error) {
      console.error('NotificationService: Error during registration:', error);
      return {
        success: false,
        token: null,
        permissionStatus: {
          granted: false,
          canAskAgain: false,
          status: 'denied' as Notifications.PermissionStatus,
        },
      };
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('NotificationService: Notification received:', notification);
    });

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('NotificationService: Notification response:', response);
    });

    return {
      notificationListener,
      responseListener,
    };
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners(listeners: {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  }) {
    Notifications.removeNotificationSubscription(listeners.notificationListener);
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }
}

export const notificationService = new NotificationService();
