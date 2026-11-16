import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import CommonButton from '@/components/CommonButton';
import CommonInput from '@/components/CommonInput';
import { Colors } from '@/constants/Colors';
import { PARTY_SIZES, partyApi } from '@/api/party';
import { styles } from './PartyNewScreen.styles';

// 날짜·시간 선택 패키지를 들이지 않으려고 7일 × 정해진 시각 중에서 고르게 한다.
const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});
const HOURS = [12, 14, 16, 18, 19, 20, 21];
const dayLabel = (d: Date, i: number) =>
  i === 0 ? '오늘' : i === 1 ? '내일' : `${d.getMonth() + 1}/${d.getDate()}`;

interface ChipsProps<T> {
  options: T[];
  selected: T;
  label: (option: T, index: number) => string;
  onSelect: (option: T) => void;
  isDisabled?: (option: T) => boolean;
}

function Chips<T>({ options, selected, label, onSelect, isDisabled }: ChipsProps<T>) {
  return (
    <View style={styles.chips}>
      {options.map((option, i) => {
        const disabled = isDisabled?.(option) ?? false;
        const isSelected = option === selected && !disabled;
        return (
          <TouchableOpacity
            key={label(option, i)}
            disabled={disabled}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              disabled && styles.chipDisabled,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {label(option, i)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PartyNewScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState(DAYS[1]);
  const [hour, setHour] = useState(19);
  const [size, setSize] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const meetAtOf = (d: Date, h: number) => {
    const at = new Date(d);
    at.setHours(h, 0, 0, 0);
    return at;
  };
  const isPast = (h: number) => meetAtOf(day, h).getTime() <= Date.now();

  const handleCreate = async () => {
    if (!title.trim() || !place.trim()) {
      setMessage('제목과 장소를 입력해 주세요.');
      return;
    }
    if (isPast(hour)) {
      setMessage('지금 이후의 시간을 골라 주세요.');
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      const party = await partyApi.create({
        title,
        place,
        description,
        meetAt: meetAtOf(day, hour).toISOString(),
        size,
      });
      router.replace({ pathname: '/party/[id]', params: { id: party.id } });
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CommonInput
        label="제목"
        value={title}
        onChangeText={setTitle}
        maxLength={40}
        placeholder="예: 금요일 저녁 2:2 미팅"
      />
      <CommonInput
        label="장소"
        value={place}
        onChangeText={setPlace}
        maxLength={60}
        placeholder="예: 신촌역 근처 술집"
      />

      <Text style={styles.label}>날짜</Text>
      <Chips options={DAYS} selected={day} label={(d, i) => dayLabel(d, i)} onSelect={setDay} />

      <Text style={styles.label}>시간</Text>
      <Chips
        options={HOURS}
        selected={hour}
        label={(h) => `${h}:00`}
        onSelect={setHour}
        isDisabled={isPast}
      />

      <Text style={styles.label}>인원 (남녀 각각)</Text>
      <Chips options={PARTY_SIZES} selected={size} label={(n) => `${n}:${n}`} onSelect={setSize} />

      <Text style={styles.label}>소개</Text>
      <TextInput
        style={styles.description}
        value={description}
        onChangeText={setDescription}
        maxLength={500}
        multiline
        placeholder="어떤 모임인지 알려 주세요"
        placeholderTextColor={Colors.gray400}
      />

      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <CommonButton
        title="파티 열기"
        onPress={handleCreate}
        isLoading={isSaving}
        disabled={isSaving}
      />
    </ScrollView>
  );
}
