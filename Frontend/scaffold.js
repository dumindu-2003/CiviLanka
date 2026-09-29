#!/usr/bin/env node
/**
 * Civil Registration Tracker - React Native folder scaffold
 *
 * Usage (inside the Expo project folder, VS Code terminal):
 *   node scaffold.js            -> creates every folder/file (skips files that already exist)
 *   node scaffold.js --force    -> overwrites existing files
 *
 * Optional: npm pkg set scripts.scaffold="node scaffold.js"   then   npm run scaffold
 */

const FILES = {
  '.env': `# Android emulator -> your PC. For a real phone use your PC LAN IP, e.g. http://192.168.1.10:5000
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
`,
  'App.tsx': `import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
`,
  'src/actions/authAction.ts': `import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import type { LoginPayload } from '../types/auth';

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload) => {
  const result = await authService.login(payload);
  await tokenStorage.set(result.token);
  return result;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await tokenStorage.clear();
});
`,
  'src/actions/districtAction.ts': `import { createAsyncThunk } from '@reduxjs/toolkit';
import { districtService } from '../services/districtService';
import type { SignOffCredentials } from '../types/auth';
import type { Category, Decision } from '../types/district';

export const loadDashboard = createAsyncThunk('district/loadDashboard', async (category: Category) => {
  const [summary, queue] = await Promise.all([
    districtService.getSummary(),
    districtService.getQueue(category),
  ]);
  return { summary, queue, category };
});

export const decideApplication = createAsyncThunk(
  'district/decideApplication',
  async (
    arg: { id: string; decision: Decision; credentials: SignOffCredentials },
    { dispatch, getState },
  ) => {
    await districtService.decide(arg.id, arg.decision, arg.credentials);
    // Inline state shape (not RootState) avoids a circular type reference with the store
    const { category } = (getState() as { district: { category: Category } }).district;
    await dispatch(loadDashboard(category)); // refresh tiles + queue
  },
);
`,
  'src/components/AppButton.tsx': `import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, MIN_TOUCH } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'outline' ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: colors.primary, opacity: disabled ? 0.5 : 1 },
        variant === 'outline' && { borderWidth: 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.text, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: MIN_TOUCH, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginVertical: 6 },
  text: { fontWeight: '600', fontSize: 16 },
});
`,
  'src/components/AuthorizeSignOffModal.tsx': `import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { TextField } from './TextField';
import { AppButton } from './AppButton';
import type { SignOffCredentials } from '../types/auth';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (c: SignOffCredentials) => void;
}

export function AuthorizeSignOffModal({ visible, title = 'Authorizing Officer Verification', onCancel, onConfirm }: Props) {
  const [officerUserName, setUser] = useState('');
  const [authorizingServiceNo, setSvc] = useState('');
  const [officerPassword, setPwd] = useState('');

  const submit = () => {
    onConfirm({ officerUserName, authorizingServiceNo, officerPassword });
    setPwd(''); // do not keep the password in state
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>Digital sign-off protocol</Text>
          <TextField label="Authorizing Service No" value={authorizingServiceNo} onChangeText={setSvc} />
          <TextField label="Officer User Name" value={officerUserName} onChangeText={setUser} autoCapitalize="none" />
          <TextField label="Officer Password" value={officerPassword} onChangeText={setPwd} secureTextEntry />
          <AppButton
            title="Authorize & Submit"
            onPress={submit}
            disabled={!officerUserName || !authorizingServiceNo || !officerPassword}
          />
          <AppButton title="Cancel" variant="outline" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.primary },
  sub: { color: colors.muted, marginBottom: 12 },
});
`,
  'src/components/PlaceholderScreen.tsx': `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

// Temporary screen. Replace with the real UI from Figma.
export function PlaceholderScreen({ title, owner, note }: { title: string; owner: string; note?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>TODO ({owner}): build this screen from Figma</Text>
      {note ? <Text style={styles.sub}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  sub: { color: colors.muted, textAlign: 'center' },
});
`,
  'src/components/StatTile.tsx': `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: '48%', flexGrow: 1, backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 13 },
  value: { color: colors.primary, fontSize: 26, fontWeight: '700', marginTop: 4 },
});
`,
  'src/components/StatusBadge.tsx': `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type Status = 'Pending' | 'Approved' | 'Rejected';
const tone: Record<Status, string> = { Pending: colors.warning, Approved: colors.success, Rejected: colors.danger };

export function StatusBadge({ status }: { status: Status }) {
  return (
    <View style={[styles.badge, { borderColor: tone[status] }]}>
      <Text style={[styles.text, { color: tone[status] }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '600' },
});
`,
  'src/components/TextField.tsx': `import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string; // validation message shown next to the field
}

export function TextField({ label, error, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? { borderColor: colors.danger } : null]}
        placeholderTextColor={colors.muted}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, minHeight: 48, color: colors.text, backgroundColor: '#fff' },
  error: { color: colors.danger, marginTop: 4, fontSize: 12 },
});
`,
  'src/navigation/MainTabs.tsx': `import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../store/hooks';
import { dashboards, NotAvailableScreen } from './screenRegistry';
import NewsScreen from '../screens/shared/NewsScreen';
import NotificationScreen from '../screens/shared/NotificationScreen';
import MyProfileScreen from '../screens/shared/MyProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  News: 'newspaper',
  Notification: 'notifications',
  Profile: 'person',
};

export default function MainTabs() {
  const homeScreen = useAppSelector((s) => s.auth.homeScreen);
  const Dashboard = (homeScreen && dashboards[homeScreen]) || NotAvailableScreen;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}
`,
  'src/navigation/RootNavigator.tsx': `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { stackScreens } from './screenRegistry';
import MainTabs from './MainTabs';
import LandingScreen from '../screens/shared/LandingScreen';
import LoginScreen from '../screens/shared/LoginScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const user = useAppSelector((s) => s.auth.user);
  const allowedScreens = useAppSelector((s) => s.auth.allowedScreens);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Only screens allowed by the backend are registered
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      {allowedScreens
        .filter((key) => stackScreens[key])
        .map((key) => (
          <Stack.Screen
            key={key}
            name={key as keyof RootStackParamList}
            component={stackScreens[key].component}
            options={{ title: stackScreens[key].title }}
          />
        ))}
    </Stack.Navigator>
  );
}
`,
  'src/navigation/screenRegistry.ts': `import React from 'react';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import DistrictDashboardScreen from '../screens/district/DistrictDashboardScreen';
import ReportsScreen from '../screens/district/ReportsScreen';
import NicPendingListScreen from '../screens/district/NicPendingListScreen';
import NicApplicationReviewScreen from '../screens/district/NicApplicationReviewScreen';
// Other developers: import your screens here

// Backend \`homeScreen\` value -> component shown in the Home tab
export const dashboards: Record<string, ComponentType<any>> = {
  DistrictDashboard: DistrictDashboardScreen,
  // BirthDashboard: BirthDashboardScreen,        // DEV2
  // DeathDashboard: DeathDashboardScreen,        // DEV2
  // MarriageDashboard: MarriageDashboardScreen,  // DEV3
  // BankDashboard: BankDashboardScreen,          // DEV3
  // VillageDashboard: VillageDashboardScreen,    // DEV4
};

// Backend \`allowedScreens\` value -> stack screen
export const stackScreens: Record<string, { component: ComponentType<any>; title: string }> = {
  Reports: { component: ReportsScreen, title: 'Reports' },
  NicPendingList: { component: NicPendingListScreen, title: 'NIC Pending Applications' },
  NicApplicationReview: { component: NicApplicationReviewScreen, title: 'NIC Application Review' },
};

// Shown when the backend sends a key the app does not know (prevents a crash)
export const NotAvailableScreen = () =>
  React.createElement(
    View,
    { style: { flex: 1, alignItems: 'center', justifyContent: 'center' } },
    React.createElement(Text, null, 'This screen is not available yet.'),
  );
`,
  'src/navigation/types.ts': `export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  MainTabs: undefined;
  // District
  Reports: undefined;
  NicPendingList: undefined;
  NicApplicationReview: { applicationId: string };
  // Other developers: add your route names here
};
`,
  'src/reducers/authReducer.ts': `import { createSlice } from '@reduxjs/toolkit';
import { login, logout } from '../actions/authAction';
import type { AuthUser } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  homeScreen: string | null;
  allowedScreens: string[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  homeScreen: null,
  allowedScreens: [],
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'idle';
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.homeScreen = a.payload.homeScreen;
        s.allowedScreens = a.payload.allowedScreens;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.error.message ?? 'Login failed';
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export default authSlice.reducer;
`,
  'src/reducers/districtReducer.ts': `import { createSlice } from '@reduxjs/toolkit';
import { decideApplication, loadDashboard } from '../actions/districtAction';
import type { ApplicationItem, Category, DashboardSummary } from '../types/district';

interface DistrictState {
  summary: DashboardSummary | null;
  queue: ApplicationItem[];
  category: Category;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: DistrictState = {
  summary: null,
  queue: [],
  category: 'All',
  status: 'idle',
  error: null,
};

const districtSlice = createSlice({
  name: 'district',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(loadDashboard.fulfilled, (s, a) => {
        s.status = 'idle';
        s.summary = a.payload.summary;
        s.queue = a.payload.queue;
        s.category = a.payload.category;
      })
      .addCase(loadDashboard.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.error.message ?? 'Failed to load';
      })
      .addCase(decideApplication.rejected, (s, a) => {
        s.error = a.error.message ?? 'Action failed';
      });
  },
});

export default districtSlice.reducer;
`,
  'src/screens/district/DistrictDashboardScreen.tsx': `import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { decideApplication, loadDashboard } from '../../actions/districtAction';
import { StatTile } from '../../components/StatTile';
import { StatusBadge } from '../../components/StatusBadge';
import { AppButton } from '../../components/AppButton';
import { AuthorizeSignOffModal } from '../../components/AuthorizeSignOffModal';
import type { RootStackParamList } from '../../navigation/types';
import type { SignOffCredentials } from '../../types/auth';
import type { ApplicationItem, Category, Decision } from '../../types/district';
import { colors, spacing } from '../../theme';

const CATEGORIES: Category[] = ['All', 'Birth', 'Death', 'Marriage'];

export default function DistrictDashboardScreen() {
  const dispatch = useAppDispatch();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { summary, queue, category, status, error } = useAppSelector((s) => s.district);
  const user = useAppSelector((s) => s.auth.user);

  const [pending, setPending] = useState<{ id: string; decision: Decision } | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadDashboard(category));
    }, [dispatch, category]),
  );

  const confirm = async (credentials: SignOffCredentials) => {
    if (!pending) return;
    const result = await dispatch(decideApplication({ ...pending, credentials }));
    setPending(null);
    if (decideApplication.rejected.match(result)) {
      Alert.alert('Not authorized', result.error.message ?? 'Action failed');
    }
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>{item.id} · {item.category}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.muted}>{item.applicantName} · {item.submittedOn}</Text>
      <View style={styles.row}>
        <AppButton
          title="View"
          variant="outline"
          style={styles.flex}
          onPress={() => nav.navigate('NicApplicationReview', { applicationId: item.id })}
        />
        <AppButton
          title="Approve"
          style={styles.flex}
          disabled={item.status !== 'Pending'}
          onPress={() => setPending({ id: item.id, decision: 'APPROVE' })}
        />
        <AppButton
          title="Reject"
          variant="danger"
          style={styles.flex}
          disabled={item.status !== 'Pending'}
          onPress={() => setPending({ id: item.id, decision: 'REJECT' })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={queue}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshing={status === 'loading'}
        onRefresh={() => dispatch(loadDashboard(category))}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={
          <>
            <Text style={styles.welcome}>Welcome, {user?.fullName}</Text>
            <View style={styles.tiles}>
              <StatTile label="Pending Approvals" value={summary?.pending ?? '-'} />
              <StatTile label="Approved" value={summary?.approved ?? '-'} />
              <StatTile label="Rejected" value={summary?.rejected ?? '-'} />
              <StatTile label="Total Records" value={summary?.totalRecords ?? '-'} />
            </View>

            <Text style={styles.section}>Queue Filters</Text>
            <View style={styles.row}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => dispatch(loadDashboard(c))}
                  style={[styles.chip, c === category && styles.chipActive]}
                >
                  <Text style={[styles.chipText, c === category && { color: '#fff' }]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>Applications Queue</Text>
            {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
          </>
        }
        ListFooterComponent={
          <View style={{ marginTop: spacing.md }}>
            <AppButton title="Generate Report" onPress={() => nav.navigate('Reports')} />
            <AppButton title="NIC Requests" variant="outline" onPress={() => nav.navigate('NicPendingList')} />
          </View>
        }
      />

      <AuthorizeSignOffModal
        visible={!!pending}
        title={pending?.decision === 'APPROVE' ? 'Authorize Approval' : 'Authorize Rejection'}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  welcome: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  section: { fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  flex: { flex: 1 },
  chip: { paddingHorizontal: 14, minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.primary },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: spacing.md, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginVertical: 6 },
});
`,
  'src/screens/district/NicApplicationReviewScreen.tsx': `import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { RootStackParamList } from '../../navigation/types';

export default function NicApplicationReviewScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'NicApplicationReview'>>();
  return <PlaceholderScreen title="NIC Application Review" owner="LEAD" note={\`Application: \${params.applicationId}\`} />;
}
`,
  'src/screens/district/NicPendingListScreen.tsx': `import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function NicPendingListScreen() {
  return <PlaceholderScreen title="NIC Pending Applications" owner="LEAD" />;
}
`,
  'src/screens/district/ReportsScreen.tsx': `import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function ReportsScreen() {
  return <PlaceholderScreen title="Reports" owner="LEAD" />;
}
`,
  'src/screens/shared/LandingScreen.tsx': `import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

const CARDS = [
  { title: 'Our Vision', body: 'Reliable, secure and transparent civil registration for every citizen.' },
  { title: 'Our Goals', body: 'Faster processing, real-time data collection and 100% accountability.' },
  { title: 'Our Mission', body: 'Reduce manual work with a simple, role-based digital tracker.' },
];

// Public home page shown before login. Refine using the Figma "Home Screen".
export default function LandingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>GovernReg Digital System</Text>
      <Text style={styles.sub}>Documentation Tracker · Restricted access</Text>
      {CARDS.map((c) => (
        <View key={c.title} style={styles.card}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.cardBody}>{c.body}</Text>
        </View>
      ))}
      <AppButton title="Log in" onPress={() => nav.navigate('Login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  brand: { fontSize: 24, fontWeight: '700', color: colors.primary, marginTop: spacing.lg },
  sub: { color: colors.muted, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: 10, padding: spacing.md, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardBody: { color: colors.muted },
});
`,
  'src/screens/shared/LoginScreen.tsx': `import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../actions/authAction';
import { TextField } from '../../components/TextField';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../theme';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [username, setUsername] = useState('');
  const [serviceNo, setServiceNo] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = username.trim() && serviceNo.trim() && password;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Officer Authentication</Text>
      <Text style={styles.sub}>Enter your authorized government service credentials.</Text>

      <TextField label="Government Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextField label="Service No" value={serviceNo} onChangeText={setServiceNo} autoCapitalize="characters" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        title="Sign In to System"
        loading={status === 'loading'}
        disabled={!canSubmit}
        onPress={() => dispatch(login({ username: username.trim(), serviceNo: serviceNo.trim(), password }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.card, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  sub: { color: colors.muted, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
});
`,
  'src/screens/shared/MyProfileScreen.tsx': `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../actions/authAction';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../theme';

// Basic version (own profile + logout). DEV4 extends it from Figma "My Profile".
export default function MyProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.meta}>{user?.designation}</Text>
      <Text style={styles.meta}>Service No: {user?.serviceNo}</Text>
      <AppButton title="Logout" variant="outline" onPress={() => dispatch(logout())} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  name: { fontSize: 22, fontWeight: '700', color: colors.primary },
  meta: { color: colors.muted, marginBottom: spacing.sm },
});
`,
  'src/screens/shared/NewsScreen.tsx': `import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function NewsScreen() {
  return <PlaceholderScreen title="News" owner="DEV4" />;
}
`,
  'src/screens/shared/NotificationScreen.tsx': `import React from 'react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export default function NotificationScreen() {
  return <PlaceholderScreen title="Notifications" owner="DEV4" />;
}
`,
  'src/services/apiClient.ts': `import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const http = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000', // Android emulator -> PC
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Response envelope agreed with the ASP.NET developers
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * The ONLY function that talks to the backend.
 * POST /api/{route}   body: { actionType, ...payload }
 * actionType = the @ActionType value inside the SQL procedure
 */
export async function callAction<T>(route: string, actionType: string, payload: object = {}): Promise<T> {
  try {
    const res = await http.post<ApiResponse<T>>(\`/api/\${route}\`, { actionType, ...payload });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  } catch (e: any) {
    throw new Error(e?.response?.data?.message ?? e?.message ?? 'Network error');
  }
}
`,
  'src/services/authService.ts': `import { callAction } from './apiClient';
import type { LoginPayload, LoginResult } from '../types/auth';

const ROUTE = 'auth';
const ACTION = { LOGIN: 'LOGIN' } as const;

export const authService = {
  login: (p: LoginPayload) => callAction<LoginResult>(ROUTE, ACTION.LOGIN, p),
};
`,
  'src/services/districtService.ts': `import { callAction } from './apiClient';
import type { SignOffCredentials } from '../types/auth';
import type { ApplicationItem, Category, DashboardSummary, Decision } from '../types/district';

const ROUTE = 'district';
// These values must match @ActionType in the SQL procedure
const ACTION = {
  SUMMARY: 'SUMMARY',
  LIST: 'LIST',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const;

export const districtService = {
  getSummary: () => callAction<DashboardSummary>(ROUTE, ACTION.SUMMARY),

  getQueue: (category: Category) => callAction<ApplicationItem[]>(ROUTE, ACTION.LIST, { category }),

  decide: (applicationId: string, decision: Decision, credentials: SignOffCredentials) =>
    callAction<null>(ROUTE, decision === 'APPROVE' ? ACTION.APPROVE : ACTION.REJECT, {
      applicationId,
      ...credentials,
    }),
};
`,
  'src/services/tokenStorage.ts': `import * as SecureStore from 'expo-secure-store';

const KEY = 'auth_token';

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (t: string) => SecureStore.setItemAsync(KEY, t),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
`,
  'src/store/hooks.ts': `import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`,
  'src/store/store.ts': `import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import districtReducer from '../reducers/districtReducer';
// Other developers: add your reducer here (one line)

export const store = configureStore({
  reducer: {
    auth: authReducer,
    district: districtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`,
  'src/theme/index.ts': `export const colors = {
  primary: '#0F1F4B',
  accent: '#F5B800',
  text: '#111827',
  muted: '#4B5563', // dark enough for WCAG AA on white
  border: '#D1D5DB',
  background: '#F3F4F6',
  card: '#FFFFFF',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };
export const MIN_TOUCH = 44; // minimum touch target (usability test T03)
`,
  'src/types/auth.ts': `export interface AuthUser {
  id: string;
  fullName: string;
  serviceNo: string;
  designation: string;
  role: string; // value comes from the backend; no role list in the frontend
}

export interface LoginPayload {
  username: string;
  serviceNo: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
  homeScreen: string;
  allowedScreens: string[];
}

// Credentials from the Authority (sign-off) modal
export interface SignOffCredentials {
  officerUserName: string;
  authorizingServiceNo: string;
  officerPassword: string;
}
`,
  'src/types/district.ts': `import type { Status } from '../components/StatusBadge';

export type Category = 'All' | 'Birth' | 'Death' | 'Marriage';
export type Decision = 'APPROVE' | 'REJECT';

export interface DashboardSummary {
  pending: number;
  approved: number;
  rejected: number;
  totalRecords: number;
}

export interface ApplicationItem {
  id: string; // e.g. APP001
  category: Exclude<Category, 'All'>;
  applicantName: string;
  submittedOn: string;
  status: Status;
}
`,
};

// ---------------------------------------------------------------------------
// Stub files for the other developers (empty, compile-safe, owner noted)
// ---------------------------------------------------------------------------
const OWNERS = { birth: 'DEV2', death: 'DEV2', marriage: 'DEV3', bank: 'DEV3', village: 'DEV4' };
for (const [name, dev] of Object.entries(OWNERS)) {
  FILES[`src/services/${name}Service.ts`] =
    `// ${dev}: ${name} API calls. Use callAction(ROUTE, ACTION, payload) from './apiClient'.\nexport {};\n`;
  FILES[`src/actions/${name}Action.ts`] =
    `// ${dev}: ${name} thunks (createAsyncThunk) that call ${name}Service.\nexport {};\n`;
  FILES[`src/reducers/${name}Reducer.ts`] =
    `// ${dev}: ${name} slice. Then add it to src/store/store.ts.\nexport {};\n`;
  FILES[`src/types/${name}.ts`] = `// ${dev}: ${name} data types.\nexport {};\n`;
  FILES[`src/screens/${name}/.gitkeep`] = '';
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const force = process.argv.includes('--force');
const root = process.cwd();

if (!fs.existsSync(path.join(root, 'package.json'))) {
  console.error('\nERROR: package.json not found. Run this inside your Expo project folder.');
  console.error('Create it first:  npx create-expo-app@latest civil-registration-app --template blank-typescript\n');
  process.exit(1);
}

let created = 0;
let skipped = 0;

for (const [rel, content] of Object.entries(FILES)) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  let overwrite = force;
  // Replace the default Expo template App.tsx (safe: it only contains the sample text)
  if (rel === 'App.tsx' && fs.existsSync(target)) {
    overwrite = overwrite || fs.readFileSync(target, 'utf8').includes('Open up App.tsx');
  }

  if (fs.existsSync(target) && !overwrite) {
    skipped++;
    console.log(`  skip    ${rel} (already exists, use --force to overwrite)`);
    continue;
  }
  fs.writeFileSync(target, content);
  created++;
  console.log(`  create  ${rel}`);
}

console.log(`\nDone. ${created} file(s) created, ${skipped} skipped.`);
console.log('\nNext:');
console.log('  1) npm i @reduxjs/toolkit react-redux axios');
console.log('  2) npx expo install expo-secure-store react-native-screens react-native-safe-area-context @expo/vector-icons');
console.log('  3) npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs');
console.log('  4) npx expo start');
