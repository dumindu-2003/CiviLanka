import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import type { RootStackParamList } from '../../navigation/types';

export default function NicApplicationReviewScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'NicApplicationReview'>>();
  return <PlaceholderScreen title="NIC Application Review" owner="LEAD" note={`Application: ${params.applicationId}`} />;
}
