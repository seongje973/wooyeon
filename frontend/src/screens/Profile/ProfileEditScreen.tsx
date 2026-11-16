import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CommonButton from '@/components/CommonButton';
import CommonInput from '@/components/CommonInput';
import { Colors } from '@/constants/Colors';
import { ApiError } from '@/api/client';
import { Gender, RADIUS_OPTIONS, profileApi } from '@/api/profile';
import { styles } from './ProfileEditScreen.styles';

export default function ProfileEditScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [bio, setBio] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    profileApi
      .getMine()
      .then((p) => {
        setNickname(p.nickname);
        setBirthYear(String(p.birthYear));
        setGender(p.gender);
        setBio(p.bio);
        setPhotoPath(p.photoPath);
        setPhotoUri(p.photoUrl);
        setRadiusKm(p.radiusKm);
      })
      .catch((err) => {
        // 처음 만드는 경우(404)는 빈 칸으로 시작한다.
        if (!(err instanceof ApiError && err.status === 404)) setMessage((err as Error).message);
      });
  }, []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setMessage('');
    try {
      const path = await profileApi.uploadPhoto(asset.uri, asset.mimeType ?? 'image/jpeg');
      setPhotoPath(path);
      setPhotoUri(asset.uri);
    } catch (err) {
      setMessage(`사진을 올리지 못했어요. ${(err as Error).message}`);
    }
  };

  const canSave = nickname.trim() !== '' && /^\d{4}$/.test(birthYear) && gender !== null;

  const save = async () => {
    if (!gender) return;
    setIsSaving(true);
    setMessage('');
    try {
      await profileApi.save({ nickname, birthYear: Number(birthYear), gender, bio, photoPath, radiusKm });
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) router.replace('/school-auth');
      else setMessage((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.photo} onPress={pickPhoto} accessibilityLabel="사진 고르기">
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoImage} />
        ) : (
          <Ionicons name="camera" size={36} color={Colors.gray600} />
        )}
      </TouchableOpacity>

      <CommonInput label="닉네임" placeholder="1~20자" value={nickname} onChangeText={setNickname} maxLength={20} />
      <CommonInput
        label="출생 연도"
        placeholder="예: 2003"
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
        maxLength={4}
      />

      <Text style={styles.label}>성별</Text>
      <View style={styles.chips}>
        {(['female', 'male'] as const).map((g) => (
          <Chip key={g} label={g === 'female' ? '여성' : '남성'} selected={gender === g} onPress={() => setGender(g)} />
        ))}
      </View>

      <Text style={styles.label}>만날 학교 범위</Text>
      <View style={styles.chips}>
        {RADIUS_OPTIONS.map((r) => (
          <Chip key={r} label={`${r}km`} selected={radiusKm === r} onPress={() => setRadiusKm(r)} />
        ))}
      </View>

      <Text style={styles.label}>소개</Text>
      <TextInput
        style={styles.bio}
        placeholder="나를 소개해 주세요 (300자 이내)"
        placeholderTextColor={Colors.gray400}
        value={bio}
        onChangeText={setBio}
        maxLength={300}
        multiline
      />

      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <CommonButton title="저장하기" onPress={save} disabled={!canSave} isLoading={isSaving} />
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}
