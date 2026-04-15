import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg2, { Path, Circle, Polyline, Line } from 'react-native-svg';
import EditIcon   from '../../../assets/edit.svg';
import DeleteIcon from '../../../assets/delete.svg';
import { supabase } from '../../../lib/supabase';

// ── Icons ────────────────────────────────────────────────────────────────────
const ProfileIcon = ({ size = 18, color = '#fff' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg2>
);

const SettingsIcon = ({ size = 18, color = '#2D2F8E' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg2>
);

const LogoutIcon = ({ size = 18, color = '#ef4444' }) => (
  <Svg2 width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg2>
);

// ─── Avatar Placeholder ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#FFF8E1','#FFF3E0','#E8EAF6','#E3F2FD','#FCE4EC','#E8F5E9'];

const AvatarPlaceholder = ({ name = '?', bgColor, size = 56 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: 14,
      backgroundColor: bgColor || '#EEF0FF',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.34, fontWeight: '800', color: '#2D2F8E' }}>
        {initials}
      </Text>
    </View>
  );
};

// ─── Role badge styles ────────────────────────────────────────────────────────
const ROLE_STYLES = {
  'staff':   { bg: '#E3F2FD', color: '#1565C0', label: 'STAFF' },
  'admin':   { bg: '#FCE4EC', color: '#B71C1C', label: 'ADMIN' },
  'manager': { bg: '#E8F5E9', color: '#2E7D32', label: 'MANAGER' },
};

const getRoleStyle = (role) =>
  ROLE_STYLES[role?.toLowerCase()] ?? { bg: '#F5F6FA', color: '#555', label: (role || 'STAFF').toUpperCase() };

// ─── Staff Card ───────────────────────────────────────────────────────────────
const StaffCard = ({ member, onEdit, onDelete, onPress }) => {
  const rs = getRoleStyle(member.role);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(member)}
      activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <AvatarPlaceholder name={member.full_name || member.username} bgColor={member.avatarBg} size={56} />
        <View style={styles.cardNameBlock}>
          <Text style={styles.cardName}>{member.full_name || member.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
            <Text style={[styles.roleBadgeText, { color: rs.color }]}>{rs.label}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onEdit(member)}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <EditIcon width={17} height={17} stroke="#607D8B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(member)}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <DeleteIcon width={17} height={17} fill="#EF5350" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>USERNAME</Text>
          <Text style={styles.metaValue}>{member.username || '—'}</Text>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>PHONE NUMBER</Text>
          <Text style={styles.metaValue}>{member.phone || '—'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Salary Calculator Helpers ────────────────────────────────────────────────
const WORKING_DAYS_PER_MONTH = 26;
const WORKING_HOURS_PER_DAY  = 8;

// Given base salary, compute how much to deduct for attendance statuses this month
const computeSalary = (baseSalary, attendanceLogs) => {
  const base        = parseFloat(baseSalary) || 0;
  const perDay      = base / WORKING_DAYS_PER_MONTH;
  const perHour     = perDay / WORKING_HOURS_PER_DAY;

  let lateCount    = 0;
  let absentCount  = 0;
  let halfDayCount = 0;

  // Only look at CHECK_IN logs for this month
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  (attendanceLogs || []).forEach(log => {
    const d = new Date(log.created_at);
    if (d.getMonth() !== month || d.getFullYear() !== year) return;
    if (log.check_type !== 'CHECK_IN') return;
    const s = (log.status || '').toUpperCase();
    if (s === 'LATE')     lateCount++;
    if (s === 'ABSENT')   absentCount++;
    if (s === 'HALF-DAY') halfDayCount++;
  });

  const lateDeduction    = lateCount    * perHour * 1;      // 1 hour deducted per late
  const absentDeduction  = absentCount  * perDay;
  const halfDayDeduction = halfDayCount * (perDay / 2);
  const totalDeduction   = lateDeduction + absentDeduction + halfDayDeduction;
  const netSalary        = Math.max(0, base - totalDeduction);

  return { base, perDay, perHour, lateCount, absentCount, halfDayCount,
           lateDeduction, absentDeduction, halfDayDeduction, totalDeduction, netSalary };
};

// ─── Staff Detail Modal ───────────────────────────────────────────────────────
const StaffDetailModal = ({ visible, member, onClose, onEdit }) => {
  const [attendance, setAttendance]   = useState([]);
  const [loadingAtt, setLoadingAtt]   = useState(false);

  React.useEffect(() => {
    if (!visible || !member) return;
    const fetchAttendance = async () => {
      setLoadingAtt(true);
      try {
        const now   = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const name  = member.full_name || member.username || '';
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('id, status, check_type, created_at')
          .ilike('name', `%${name.split(' ')[0]}%`)
          .gte('created_at', start)
          .lte('created_at', end);
        if (!error) setAttendance(data || []);
      } catch (_) {}
      finally { setLoadingAtt(false); }
    };
    fetchAttendance();
  }, [visible, member]);

  if (!member) return null;
  const rs   = getRoleStyle(member.role);
  const sal  = computeSalary(member.salary, attendance);
  const fmt  = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );

  const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />
          <View style={styles.detailHeader}>
            <AvatarPlaceholder name={member.full_name || member.username} bgColor={member.avatarBg} size={68} />
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailName}>{member.full_name || member.username}</Text>
              <View style={[styles.roleBadge, { backgroundColor: rs.bg, marginTop: 6 }]}>
                <Text style={[styles.roleBadgeText, { color: rs.color }]}>{rs.label}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <DetailRow label="USERNAME" value={member.username} />
            <DetailRow label="PHONE"    value={member.phone} />
            <DetailRow label="EMAIL"    value={member.email} />
            <DetailRow label="JOINED"   value={member.created_at ? new Date(member.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />

            {/* ── Salary Section ── */}
            <View style={styles.salaryCard}>
              <View style={styles.salaryCardHeader}>
                <Text style={styles.salaryCardTitle}>💰 Salary — {monthName}</Text>
                {loadingAtt && <ActivityIndicator size="small" color="#3D5AFE" />}
              </View>

              {sal.base === 0 ? (
                <Text style={styles.salaryNoData}>No base salary set. Edit staff to add salary.</Text>
              ) : (
                <>
                  {/* Base */}
                  <View style={styles.salaryRow}>
                    <Text style={styles.salaryRowLabel}>Base Salary</Text>
                    <Text style={styles.salaryRowValue}>{fmt(sal.base)}</Text>
                  </View>

                  {/* Breakdown */}
                  <View style={styles.salaryDivider} />
                  <Text style={styles.salarySubHead}>DEDUCTIONS THIS MONTH</Text>

                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Late Arrivals ({sal.lateCount}×)</Text>
                      <Text style={styles.salaryHelperText}>1 hr deducted per late · {fmt(sal.perHour)}/hr</Text>
                    </View>
                    <Text style={[styles.salaryRowValue, { color: '#EF5350' }]}>−{fmt(sal.lateDeduction)}</Text>
                  </View>

                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Absences ({sal.absentCount}×)</Text>
                      <Text style={styles.salaryHelperText}>Full day · {fmt(sal.perDay)}/day</Text>
                    </View>
                    <Text style={[styles.salaryRowValue, { color: '#EF5350' }]}>−{fmt(sal.absentDeduction)}</Text>
                  </View>

                  <View style={styles.salaryRow}>
                    <View>
                      <Text style={styles.salaryRowLabel}>Half Days ({sal.halfDayCount}×)</Text>
                      <Text style={styles.salaryHelperText}>Half day · {fmt(sal.perDay / 2)}/day</Text>
                    </View>
                    <Text style={[styles.salaryRowValue, { color: '#EF5350' }]}>−{fmt(sal.halfDayDeduction)}</Text>
                  </View>

                  {/* Net */}
                  <View style={styles.salaryDivider} />
                  <View style={[styles.salaryRow, styles.salaryNetRow]}>
                    <Text style={styles.salaryNetLabel}>NET PAYABLE</Text>
                    <Text style={styles.salaryNetValue}>{fmt(sal.netSalary)}</Text>
                  </View>
                  <Text style={styles.salaryBasis}>Based on {WORKING_DAYS_PER_MONTH} working days, {WORKING_HOURS_PER_DAY} hrs/day</Text>
                </>
              )}
            </View>
          </ScrollView>
          <View style={styles.detailFooter}>
            <TouchableOpacity style={styles.detailEditBtn} onPress={() => { onClose(); onEdit(member); }} activeOpacity={0.85}>
              <EditIcon width={15} height={15} stroke="#fff" />
              <Text style={styles.detailEditBtnText}>EDIT STAFF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.detailCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Add / Edit Staff Modal ───────────────────────────────────────────────────
const AddStaffModal = ({ visible, onClose, onRefresh, editingMember }) => {
  const isEdit = !!editingMember;

  const [fullName,  setFullName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [role,      setRole]      = useState('staff');
  const [salary,    setSalary]    = useState('');
  const [saving,    setSaving]    = useState(false);

  // Pre-fill on edit
  React.useEffect(() => {
    if (editingMember) {
      setFullName(editingMember.full_name || '');
      setUsername(editingMember.username  || '');
      setPhone(editingMember.phone        || '');
      setRole(editingMember.role          || 'staff');
      setSalary(editingMember.salary ? String(editingMember.salary) : '');
    } else {
      setFullName(''); setUsername(''); setPhone(''); setRole('staff'); setSalary('');
    }
  }, [editingMember, visible]);

  const resetAndClose = () => {
    setFullName(''); setUsername(''); setPhone(''); setRole('staff'); setSalary('');
    onClose();
  };

  const handleSave = async () => {
    if (!fullName.trim()) { Alert.alert('Missing', 'Please enter the full name.'); return; }
    if (!username.trim()) { Alert.alert('Missing', 'Please enter a username.');    return; }

    setSaving(true);
    try {
      const trimmedUsername = username.trim().toLowerCase();
      const email    = `${trimmedUsername}@vishnumobileshop.com`;
      // Auto-generate password: username@123
      const autoPass = `${trimmedUsername}@123`;

      if (isEdit) {
        // ── Update profile fields in DB ────────────────────────────
        const updates = {
          full_name: fullName.trim(),
          username:  username.trim(),
          phone:     phone.trim() || null,
          role,
          salary:    salary.trim() ? parseFloat(salary.trim()) : null,
        };
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', editingMember.id);
        if (error) throw error;
        Alert.alert('✅ Updated', 'Staff member updated successfully!');
      } else {
        // ── Create new Supabase Auth user via secure Edge Function ───────
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-staff', {
          body: {
            email,
            password: autoPass,
            username: username.trim(),
            fullName: fullName.trim(),
            phone: phone.trim() || null,
            role,
          }
        });

        if (edgeError) throw edgeError;
        if (edgeData?.error) throw new Error(edgeData.error);

        // Update the newly created profile with the rest of the metadata like avatarBg and salary
        // Edge function handles the role setup
        if (edgeData?.user) {
          const bg = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
          await supabase.from('profiles').update({
            avatar_bg: bg,
            salary: salary.trim() ? parseFloat(salary.trim()) : null,
          }).eq('id', edgeData.user.id);
        }

        Alert.alert(
          '✅ Staff Added',
          `${fullName.trim()} added as ${role}.\n\nUsername: ${username.trim()}\nPassword: ${autoPass}\n\nThey must wait for your approval before logging in.`
        );
      }

      onRefresh();
      resetAndClose();
    } catch (e) {
      console.error('handleSave error detail:', e);
      let errorMsg = e.message || 'Failed to save staff.';
      
      // If it's a Supabase Function error, it might have more detail
      if (e.context?.status) {
        errorMsg = `Error ${e.context.status}: ${errorMsg}`;
      } else if (e.status) {
        errorMsg = `Error ${e.status}: ${errorMsg}`;
      }

      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const ROLES = ['staff', 'manager', 'admin'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</Text>
              <Text style={styles.modalSubtitle}>
                {isEdit ? 'Update details below' : 'Register a new employee'}
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#BFC8D6"
                value={fullName}
                onChangeText={setFullName}
                editable={!saving}
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>USERNAME *</Text>
              <TextInput
                style={[styles.fieldInput, isEdit && { backgroundColor: '#f5f6fa', color: '#aaa' }]}
                placeholder="vms_rahul"
                placeholderTextColor="#BFC8D6"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!saving && !isEdit}
              />
              {!isEdit && (
                <Text style={styles.fieldHint}>Login email: {username.toLowerCase() || 'vms_username'}@vishnumobileshop.com</Text>
              )}
            </View>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#BFC8D6"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!saving}
              />
            </View>

            {/* Role */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ROLE</Text>
              <View style={styles.roleRow}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                    onPress={() => setRole(r)}
                    disabled={saving}>
                    <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Salary */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MONTHLY SALARY (₹)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. 10000"
                placeholderTextColor="#BFC8D6"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                editable={!saving}
              />
              <Text style={styles.fieldHint}>Used for automatic deduction calculation based on attendance</Text>
            </View>

            {/* Auto-password info (add only) */}
            {!isEdit && (
              <View style={[styles.fieldGroup, { backgroundColor: '#F0FFF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' }]}>
                <Text style={[styles.fieldLabel, { color: '#166534' }]}>🔑 AUTO-GENERATED PASSWORD</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#15803D', fontFamily: 'monospace' }}>
                  {username.trim().toLowerCase() || 'username'}@123
                </Text>
                <Text style={[styles.fieldHint, { color: '#166534', marginTop: 6 }]}>
                  Staff must wait for your approval before they can login.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>{isEdit ? 'UPDATE' : 'SAVE STAFF'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StaffListScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [staff,              setStaff]              = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [addModalVisible,    setAddModalVisible]    = useState(false);
  const [editingMember,      setEditingMember]      = useState(null);
  const [detailMember,       setDetailMember]       = useState(null);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [pendingRequests,    setPendingRequests]    = useState([]);
  const [pendingLoading,     setPendingLoading]     = useState(false);
  const [showPendingPanel,   setShowPendingPanel]   = useState(false);

  const handleLogout = () => {
    setProfileMenuVisible(false);
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  // ── Load staff from Supabase profiles table ──────────────────────
  const loadStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, phone, email, created_at, avatar_bg, salary, is_approved')
        .eq('is_approved', true) // Only show approved members in the main dashboard
        .order('created_at', { ascending: true });

      if (error) throw error;

      const withColors = (data || []).map((m, i) => ({
        ...m,
        avatarBg: m.avatar_bg || AVATAR_COLORS[i % AVATAR_COLORS.length],
      }));
      setStaff(withColors);
    } catch (e) {
      console.error('loadStaff error:', e.message);
      Alert.alert('Error', 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  // ── Load pending login requests ───────────────────────────────────
  const loadPendingRequests = async () => {
    setPendingLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_login_requests')
        .select('id, staff_id, username, full_name, requested_at, status')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });
      if (!error) {
        setPendingRequests(data || []);
      } else {
        console.warn('⚠️ Pending requests error:', error.message);
      }
    } catch (e) {
      console.warn('⚠️ Pending requests exception:', e.message);
    }
    finally { setPendingLoading(false); }
  };

  // ── Approve a staff login request ─────────────────────────────────
  const handleApproveStaff = async (req) => {
    try {
      // 1. Set is_approved = true on profiles
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', req.staff_id);
      if (profErr) throw profErr;

      // 2. Update request status to approved
      await supabase
        .from('pending_login_requests')
        .update({ status: 'approved' })
        .eq('id', req.id);

      Alert.alert('✅ Approved', `${req.full_name || req.username} can now login.`);
      loadPendingRequests();
      loadStaff();
    } catch (e) {
      Alert.alert('Error', 'Failed to approve: ' + e.message);
    }
  };

  // ── Reject a staff login request ──────────────────────────────────
  const handleRejectStaff = (req) => {
    Alert.alert(
      'Reject Login',
      `Reject login request from ${req.full_name || req.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject', style: 'destructive',
          onPress: async () => {
            await supabase
              .from('pending_login_requests')
              .update({ status: 'rejected' })
              .eq('id', req.id);
            loadPendingRequests();
          },
        },
      ]
    );
  };

  useFocusEffect(useCallback(() => { loadStaff(); loadPendingRequests(); }, []));

  const handleEdit = (member) => {
    setEditingMember(member);
    setAddModalVisible(true);
  };

  const handleDelete = (member) => {
    Alert.alert(
      'Delete Staff',
      `Remove ${member.full_name || member.username} from the system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', member.id);
              if (error) throw error;
              setStaff(prev => prev.filter(s => s.id !== member.id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete staff member.\n' + e.message);
            }
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setEditingMember(null);
    setAddModalVisible(true);
  };

  const totalActive  = staff.length;
  const admins       = staff.filter(s => s.role === 'admin').length;
  const staffCount   = staff.filter(s => s.role !== 'admin').length;
  const pendingCount = pendingRequests.length;

  // ── Filter staff based on search query ───────────────────────────
  const filteredStaff = searchQuery.trim()
    ? staff.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
          (s.full_name  || '').toLowerCase().includes(q) ||
          (s.username   || '').toLowerCase().includes(q) ||
          (s.phone      || '').toLowerCase().includes(q) ||
          (s.role       || '').toLowerCase().includes(q)
        );
      })
    : staff;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

      {/* Profile Dropdown Modal */}
      <Modal visible={profileMenuVisible} transparent animationType="fade" onRequestClose={() => setProfileMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>VM</Text>
              </View>
              <View>
                <Text style={styles.dropdownName}>Vishnu Mobile Shop</Text>
                <Text style={styles.dropdownRole}>Administrator</Text>
              </View>
            </View>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setProfileMenuVisible(false); navigation.navigate('Settings'); }}>
              <View style={styles.dropdownItemIcon}><SettingsIcon size={18} color="#2D2F8E" /></View>
              <Text style={styles.dropdownItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.dropdownSep} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <View style={[styles.dropdownItemIcon, styles.dropdownItemIconDanger]}><LogoutIcon size={18} color="#ef4444" /></View>
              <Text style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add / Edit Modal */}
      <AddStaffModal
        visible={addModalVisible}
        onClose={() => { setAddModalVisible(false); setEditingMember(null); }}
        onRefresh={loadStaff}
        editingMember={editingMember}
      />

      {/* Detail Modal */}
      <StaffDetailModal
        visible={!!detailMember}
        member={detailMember}
        onClose={() => setDetailMember(null)}
        onEdit={(m) => { setDetailMember(null); handleEdit(m); }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER (Stock Style) */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={styles.dot} />
            <Text style={styles.headerTitleText}>Vishnu Mobile Shop</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileMenuVisible(true)}>
            <ProfileIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SECTION (Stock Style) */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>ADMIN CONTROL</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={styles.mainTitle}>Staff List</Text>
            <TouchableOpacity 
              style={styles.attendanceEntryBtn} 
              onPress={() => navigation.navigate('StaffAttendance')}
              activeOpacity={0.8}
            >
              <Text style={styles.attendanceEntryBtnText}>👥 View Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 10, color: '#2D2F8E', fontWeight: '800' }}>SELF-REGISTRATION</Text>
            <Text style={{ fontSize: 9, color: '#888' }}>ENABLED</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>TOTAL STAFF</Text>
            <Text style={styles.statValue}>{String(totalActive).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>STAFF</Text>
            <Text style={styles.statValue}>{String(staffCount).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>ADMINS</Text>
            <Text style={styles.statValue}>{String(admins).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statBlock} onPress={() => setShowPendingPanel(p => !p)}>
            <Text style={[styles.statLabel, pendingCount > 0 && { color: '#EF5350' }]}>PENDING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.statValue, { color: pendingCount > 0 ? '#EF5350' : '#2D2F8E' }]}>
                {String(pendingCount).padStart(2, '0')}
              </Text>
              {pendingCount > 0 && (
                <View style={styles.pendingDot} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Pending Approvals Panel ── */}
        {showPendingPanel && (
          <View style={styles.pendingPanel}>
            <View style={styles.pendingPanelHeader}>
              <Text style={styles.pendingPanelTitle}>🔔 Pending Login Requests</Text>
              <TouchableOpacity onPress={loadPendingRequests}>
                <Text style={styles.pendingRefresh}>↻ Refresh</Text>
              </TouchableOpacity>
            </View>
            {pendingLoading ? (
              <ActivityIndicator size="small" color="#3D5AFE" style={{ paddingVertical: 12 }} />
            ) : pendingRequests.length === 0 ? (
              <Text style={styles.pendingEmpty}>✅ No pending requests</Text>
            ) : (
              pendingRequests.map(req => (
                <View key={req.id} style={styles.pendingCard}>
                  <View style={styles.pendingCardLeft}>
                    <View style={styles.pendingAvatar}>
                      <Text style={styles.pendingAvatarText}>
                        {(req.full_name || req.username || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.pendingName}>{req.full_name || req.username}</Text>
                      <Text style={styles.pendingMeta}>@{req.username}</Text>
                      <Text style={styles.pendingTime}>
                        {new Date(req.requested_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveStaff(req)}
                      activeOpacity={0.8}>
                      <Text style={styles.approveBtnText}>✓ APPROVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectStaff(req)}
                      activeOpacity={0.8}>
                      <Text style={styles.rejectBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, username, phone or role..."
            placeholderTextColor="#B0BEC5"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
    

        {/* ── Staff List ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2D2F8E" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : filteredStaff.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>{searchQuery.trim() ? '🔍' : '👥'}</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No results found' : 'No staff members yet'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery.trim() ? `No staff match "${searchQuery}"` : 'Tap + ADD STAFF to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {filteredStaff.map(member => (
              <StaffCard
                key={member.id}
                member={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPress={(m) => setDetailMember(m)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },

  fixedHeader: {
    backgroundColor: '#F5F6FA',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEEF5',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, paddingTop: 12 },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 4 },

  // Detail modal
  detailOverlay: { flex: 1, backgroundColor: 'rgba(20,20,40,0.5)', justifyContent: 'flex-end' },
  detailSheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 28, maxHeight: '80%',
    elevation: 12,
  },
  detailHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#DDE1EA', alignSelf: 'center', marginBottom: 18,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  detailHeaderText: { flex: 1 },
  detailName: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.3 },
  detailRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  detailLabel: { fontSize: 9, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1.2, marginBottom: 5 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  detailFooter: { flexDirection: 'row', gap: 10, paddingTop: 16 },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2D2F8E', borderRadius: 12, paddingVertical: 13, elevation: 4,
  },
  detailEditBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  detailCloseBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#D0D5DD', backgroundColor: '#F9FAFB', alignItems: 'center',
  },
  detailCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 0.5 },

  // Header (Stock Style Sync)
  header: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2,
    zIndex: 10,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitleText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  iconBtn: {
    backgroundColor: '#2D2F8E', borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },

  // Section (Title Area)
  section: { paddingHorizontal: 16, marginTop: 10 },
  subTitle: { fontSize: 10, color: '#999', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 5, color: '#1A1A2E' },

  // Profile Dropdown
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 68, paddingRight: 16,
  },
  dropdownMenu: {
    backgroundColor: '#fff', borderRadius: 16, width: 230,
    elevation: 12, overflow: 'hidden',
  },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#F8F9FF' },
  dropdownAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D2F8E', alignItems: 'center', justifyContent: 'center' },
  dropdownAvatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dropdownName: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  dropdownRole: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  dropdownSep: { height: 1, backgroundColor: '#F1F5F9' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF0FF', alignItems: 'center', justifyContent: 'center' },
  dropdownItemIconDanger: { backgroundColor: '#FEE2E2' },
  dropdownItemText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  dropdownItemTextDanger: { color: '#ef4444' },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18,
    elevation: 2,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '700', color: '#8A9BB0', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#2D2F8E', letterSpacing: -1 },

  // Pending dot badge
  pendingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF5350',
    position: 'absolute', top: -2, right: -10,
  },

  // Pending Panel
  pendingPanel: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF',
    borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#FFE0E0',
    elevation: 2,
  },
  pendingPanelHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  pendingPanelTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A2E' },
  pendingRefresh: { fontSize: 12, fontWeight: '700', color: '#2D2F8E' },
  pendingEmpty: { fontSize: 13, color: '#22c55e', fontWeight: '700', textAlign: 'center', paddingVertical: 8 },

  pendingCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
    justifyContent: 'space-between',
  },
  pendingCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pendingAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#EEF0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  pendingAvatarText: { fontSize: 16, fontWeight: '800', color: '#2D2F8E' },
  pendingName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  pendingMeta: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  pendingTime: { fontSize: 10, color: '#B0BEC5', marginTop: 1 },

  pendingActions: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    backgroundColor: '#22c55e', paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 8,
  },
  approveBtnText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  rejectBtn: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 10,
    paddingVertical: 7, borderRadius: 8,
  },
  rejectBtnText: { fontSize: 12, fontWeight: '800', color: '#EF5350' },
  statDivider: { width: 1, height: 40, backgroundColor: '#EDEEF5' },

  // Search bar
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#E8ECF4', elevation: 2,
  },
  searchIcon: { fontSize: 15, marginRight: 8, color: '#8A9BB0' },
  searchInput: {
    flex: 1, fontSize: 14, color: '#1A1A2E',
    paddingVertical: 0,
  },
  searchClear: { fontSize: 14, color: '#B0BEC5', fontWeight: '700', paddingLeft: 8 },

  // Card list
  cardList: { paddingHorizontal: 16, gap: 14 },

  // Staff card
  card: {
    backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 14, elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardNameBlock: { flex: 1, gap: 6 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', letterSpacing: 0.1 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center',
  },
  cardDivider: { height: 1, backgroundColor: '#F0F2F5', marginBottom: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 9, fontWeight: '700', color: '#B0BEC5', letterSpacing: 1 },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#37474F' },
  metaSeparator: { width: 1, height: 32, backgroundColor: '#EDEEF5', marginHorizontal: 16 },

  // Add Staff Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(20,20,40,0.55)',
    justifyContent: 'center', padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    paddingHorizontal: 22, paddingTop: 22, paddingBottom: 0,
    maxHeight: '90%', elevation: 14,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  modalSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  modalCloseBtn: {
    width: 32, height: 32, backgroundColor: '#F5F6FA',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 8 },
  fieldInput: {
    backgroundColor: '#F8F9FF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#E8ECF4',
  },
  fieldHint: { fontSize: 10, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },
  fieldInputMultiline: { height: 80, textAlignVertical: 'top' },

  // Role chips
  roleRow: { flexDirection: 'row', gap: 8 },
  roleChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#F5F6FA', borderWidth: 1.5, borderColor: '#E8ECF4',
  },
  roleChipActive: { backgroundColor: '#EEF0FF', borderColor: '#2D2F8E' },
  roleChipText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  roleChipTextActive: { color: '#2D2F8E' },

  modalFooter: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F0F2F5', marginTop: 8,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#D0D5DD', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#3D5AFE', alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

  // Salary card (inside Detail Modal)
  salaryCard: {
    marginTop: 18, marginBottom: 8,
    backgroundColor: '#F8F9FF', borderRadius: 16,
    padding: 16, borderWidth: 1.5, borderColor: '#E8ECF4',
  },
  salaryCardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  salaryCardTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', letterSpacing: 0.2 },
  salaryNoData: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },
  salaryRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  salaryRowLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  salaryHelperText: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  salaryRowValue: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  salaryDivider: { height: 1, backgroundColor: '#E8ECF4', marginVertical: 4 },
  salarySubHead: { fontSize: 9, fontWeight: '800', color: '#B0BEC5', letterSpacing: 1.2, marginTop: 4, marginBottom: 2 },
  salaryNetRow: { paddingVertical: 10 },
  salaryNetLabel: { fontSize: 14, fontWeight: '900', color: '#1A1A2E', letterSpacing: 0.3 },
  salaryNetValue: { fontSize: 20, fontWeight: '900', color: '#3D5AFE', letterSpacing: -0.5 },
  salaryBasis: { fontSize: 9, color: '#B0BEC5', marginTop: 4, fontStyle: 'italic' },
  attendanceEntryBtn: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  attendanceEntryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3949ab',
  },
});

export default StaffListScreen;