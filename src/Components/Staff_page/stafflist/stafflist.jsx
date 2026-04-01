import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import EditIcon from '../../../asset/edit.svg';
import DeleteIcon from '../../../asset/delete.svg';

// ─── Icon Placeholder ─────────────────────────────────────────────────────────
const IconPlaceholder = ({name, size = 20, color = '#555', bg}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      backgroundColor: bg ?? 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text style={{fontSize: size * 0.55, color, fontWeight: '700', lineHeight: size * 0.65}}>
      {name.charAt(0)}
    </Text>
  </View>
);

// ─── Avatar Placeholder ──────────────────────────────────────────────────────
const AvatarPlaceholder = ({bgColor, size = 56}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: 14,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: size,
        height: size * 0.42,
        backgroundColor: '#37474F',
        borderTopLeftRadius: size * 0.15,
        borderTopRightRadius: size * 0.15,
      }}
    />
    <View
      style={{
        width: size * 0.42,
        height: size * 0.42,
        borderRadius: size * 0.21,
        backgroundColor: '#FFCC80',
        marginBottom: size * 0.02,
        zIndex: 1,
      }}
    />
  </View>
);

// ─── Role badge colors ────────────────────────────────────────────────────────
const ROLE_STYLES = {
  'SALES ASSOCIATE': {bg: '#EDE7F6', color: '#5C35C9'},
  'INVENTORY MGR':   {bg: '#E3F2FD', color: '#1565C0'},
  'SALES LEAD':      {bg: '#E8F5E9', color: '#2E7D32'},
  'TECH SUPPORT':    {bg: '#FFF3E0', color: '#E65100'},
  'MANAGER':         {bg: '#FCE4EC', color: '#B71C1C'},
};

const ROLES = ['Sales Associate', 'Inventory Mgr', 'Sales Lead', 'Tech Support', 'Manager'];

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_STAFF = [
  {
    id: '1',
    name: 'Arjun Mehta',
    role: 'SALES ASSOCIATE',
    joiningDate: 'Oct 12, 2023',
    phone: '+91 98765-43210',
    avatarBg: '#FFF8E1',
    address: '12, Gandhi Nagar, Coimbatore, Tamil Nadu - 641001',
    username: 'vms_arjun',
    password: 'Arjun@1234',
  },
  {
    id: '2',
    name: 'Sana Khan',
    role: 'INVENTORY MGR',
    joiningDate: 'Jan 05, 2024',
    phone: '+91 98765-43211',
    avatarBg: '#FFF3E0',
    address: '45, Nehru Street, Coimbatore, Tamil Nadu - 641002',
    username: 'vms_sana',
    password: 'Sana@5678',
  },
  {
    id: '3',
    name: 'Rahul Verma',
    role: 'SALES ASSOCIATE',
    joiningDate: 'Mar 15, 2024',
    phone: '+91 98765-43212',
    avatarBg: '#E8EAF6',
    address: '78, RS Puram, Coimbatore, Tamil Nadu - 641002',
    username: 'vms_rahul',
    password: 'Rahul@9012',
  },
  {
    id: '4',
    name: 'Priya Patel',
    role: 'SALES LEAD',
    joiningDate: 'May 01, 2024',
    phone: '+91 98765-43215',
    avatarBg: '#E3F2FD',
    address: '23, Saibaba Colony, Coimbatore, Tamil Nadu - 641011',
    username: 'vms_priya',
    password: 'Priya@3456',
  },
];

// ─── Staff Card ───────────────────────────────────────────────────────────────
const StaffCard = ({member, onEdit, onDelete, onPress}) => {
  const roleStyle = ROLE_STYLES[member.role] ?? {bg: '#F5F6FA', color: '#555'};
  return (
    <TouchableOpacity
      style={[styles.card, member.isHighlighted && styles.cardHighlighted]}
      onPress={() => onPress(member)}
      activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <AvatarPlaceholder bgColor={member.avatarBg} size={56} />
        <View style={styles.cardNameBlock}>
          <Text style={styles.cardName}>{member.name}</Text>
          <View style={[styles.roleBadge, {backgroundColor: roleStyle.bg}]}>
            <Text style={[styles.roleBadgeText, {color: roleStyle.color}]}>
              {member.role}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => onEdit(member.id)}
            style={styles.actionBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <EditIcon width={17} height={17} stroke="#607D8B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(member.id)}
            style={styles.actionBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <DeleteIcon width={17} height={17} fill="#EF5350" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>JOINING DATE</Text>
          <Text style={styles.metaValue}>{member.joiningDate}</Text>
        </View>
        <View style={styles.metaSeparator} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>PHONE NUMBER</Text>
          <Text style={styles.metaValue}>{member.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Role Picker (custom inline dropdown) ─────────────────────────────────────
const RolePicker = ({value, onChange}) => {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.rolePickerBtn}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}>
        <Text style={styles.rolePickerText}>{value}</Text>
        <Text style={styles.rolePickerChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.roleDropdown}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleOption, value === r && styles.roleOptionActive]}
              onPress={() => {onChange(r); setOpen(false);}}>
              <Text style={[styles.roleOptionText, value === r && styles.roleOptionTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Staff Detail Modal ───────────────────────────────────────────────────────
const StaffDetailModal = ({visible, member, onClose, onEdit}) => {
  if (!member) return null;
  const roleStyle = ROLE_STYLES[member.role] ?? {bg: '#F5F6FA', color: '#555'};

  const DetailRow = ({label, value}) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailOverlay}>
        <View style={styles.detailSheet}>
          {/* Handle bar */}
          <View style={styles.detailHandle} />

          {/* Avatar + Name */}
          <View style={styles.detailHeader}>
            <AvatarPlaceholder bgColor={member.avatarBg} size={68} />
            <View style={styles.detailHeaderText}>
              <Text style={styles.detailName}>{member.name}</Text>
              <View style={[styles.roleBadge, {backgroundColor: roleStyle.bg, marginTop: 6}]}>
                <Text style={[styles.roleBadgeText, {color: roleStyle.color}]}>{member.role}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* All Details */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <DetailRow label="PHONE NUMBER" value={member.phone} />
            <DetailRow label="JOINING DATE" value={member.joiningDate} />
            <DetailRow label="ADDRESS" value={member.address} />
            <DetailRow label="USERNAME" value={member.username} />
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.detailFooter}>
            <TouchableOpacity
              style={styles.detailEditBtn}
              onPress={() => { onClose(); onEdit(member.id); }}
              activeOpacity={0.85}>
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

// ─── Staff Form Modal (Add + Edit) ───────────────────────────────────────────
const AddStaffModal = ({visible, onClose, onSave, onUpdate, editingMember}) => {
  const isEdit = !!editingMember;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Sales Associate');
  const [password, setPassword] = useState('');

  // Pre-fill fields when editing
  useEffect(() => {
    if (editingMember) {
      setFullName(editingMember.name || '');
      setPhone(editingMember.phone || '');
      setJoiningDate(editingMember.joiningDate || '');
      setAddress(editingMember.address || '');
      setUsername(editingMember.username || '');
      // Map role key back to picker label
      const roleMap = {
        'SALES ASSOCIATE': 'Sales Associate',
        'INVENTORY MGR': 'Inventory Mgr',
        'SALES LEAD': 'Sales Lead',
        'TECH SUPPORT': 'Tech Support',
        'MANAGER': 'Manager',
      };
      setRole(roleMap[editingMember.role] || 'Sales Associate');
      setPassword(''); // Password kept blank for security
    } else {
      setFullName(''); setPhone(''); setJoiningDate('');
      setAddress(''); setUsername(''); setRole('Sales Associate'); setPassword('');
    }
  }, [editingMember, visible]);

  const resetAndClose = () => {
    setFullName(''); setPhone(''); setJoiningDate('');
    setAddress(''); setUsername(''); setRole('Sales Associate'); setPassword('');
    onClose();
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Field', 'Please enter the full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Field', 'Please enter a phone number.');
      return;
    }

    const roleKey = role.toUpperCase() === 'INVENTORY MGR'
      ? 'INVENTORY MGR'
      : role.toUpperCase();

    if (isEdit) {
      onUpdate({
        ...editingMember,
        name: fullName.trim(),
        role: roleKey,
        joiningDate: joiningDate || editingMember.joiningDate,
        phone: phone.trim(),
        address: address.trim(),
        username: username.trim(),
        password: password.trim(),
      });
    } else {
      onSave({
        id: Date.now().toString(),
        name: fullName.trim(),
        role: roleKey,
        joiningDate: joiningDate || 'N/A',
        phone: phone.trim(),
        address: address.trim(),
        username: username.trim(),
        avatarBg: '#E8EAF6',
        isNew: true,
        isHighlighted: true,
      });
    }
    resetAndClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEdit ? 'Update staff details below' : 'Register a new employee to the system'}
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#BFC8D6"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#BFC8D6"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Joining Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>JOINING DATE</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#BFC8D6"
                value={joiningDate}
                onChangeText={setJoiningDate}
              />
            </View>

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ADDRESS</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                placeholder="Residential details..."
                placeholderTextColor="#BFC8D6"
                multiline
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
                textAlignVertical="top"
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>USERNAME</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="vms_rahul"
                placeholderTextColor="#BFC8D6"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Role */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ROLE</Text>
              <RolePicker value={role} onChange={setRole} />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>INITIAL PASSWORD</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="••••••••"
                placeholderTextColor="#BFC8D6"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>{isEdit ? 'UPDATE STAFF' : 'SAVE STAFF'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StaffListScreen = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [detailMember, setDetailMember] = useState(null);

  const totalActive = staff.length;
  const onShift = staff.filter(s => !s.isNew).length;

  const handleEdit = id => {
    const member = staff.find(s => s.id === id);
    if (member) {
      setEditingMember(member);
      setAddModalVisible(true);
    }
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Staff',
      'Are you sure you want to remove this staff member?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setStaff(prev => prev.filter(s => s.id !== id)),
        },
      ],
    );
  };

  const handleSaveStaff = newMember => {
    setStaff(prev => [...prev, newMember]);
  };

  const handleUpdateStaff = updatedMember => {
    setStaff(prev => prev.map(s => s.id === updatedMember.id ? updatedMember : s));
  };

  const openAddModal = () => {
    setEditingMember(null);
    setAddModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6FA" />

      {/* Add / Edit Staff Modal */}
      <AddStaffModal
        visible={addModalVisible}
        onClose={() => { setAddModalVisible(false); setEditingMember(null); }}
        onSave={handleSaveStaff}
        onUpdate={handleUpdateStaff}
        editingMember={editingMember}
      />

      {/* Staff Detail Modal */}
      <StaffDetailModal
        visible={!!detailMember}
        member={detailMember}
        onClose={() => setDetailMember(null)}
        onEdit={(id) => { setDetailMember(null); const m = staff.find(s => s.id === id); if (m) { setEditingMember(m); setAddModalVisible(true); } }}
      />

      {/* ── Fixed Header Section (does NOT scroll) ── */}
      <View style={styles.fixedHeader}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <View style={styles.navLeft}>
            <TouchableOpacity style={styles.menuBtn}>
              <View style={styles.menuLines}>
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, {width: 16}]} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
            <Text style={styles.navTitle}>Vishnu Mobile Shop</Text>
          </View>
          <View style={styles.navAvatar}>
            <IconPlaceholder name="User" size={28} color="#fff" bg="#3D5AFE" />
          </View>
        </View>

        <Text style={styles.navSubtitle}>Operational Intelligence Dashboard</Text>

        {/* Page Title + Add Button */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Staff List</Text>
            <View style={styles.titleUnderline} />
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openAddModal}
            activeOpacity={0.85}>
            <Text style={styles.addBtnPlus}>+</Text>
            <Text style={styles.addBtnText}>ADD NEW STAFF</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>TOTAL ACTIVE</Text>
            <Text style={styles.statValue}>{String(totalActive).padStart(2, '0')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>ON SHIFT</Text>
            <Text style={styles.statValue}>{String(onShift).padStart(2, '0')}</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable Staff Cards only ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cardList}>
          {staff.map(member => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPress={(m) => setDetailMember(m)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F5F6FA'},

  // Fixed non-scrolling header
  fixedHeader: {
    backgroundColor: '#F5F6FA',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEEF5',
  },

  scroll: {flex: 1},
  scrollContent: {paddingBottom: 32, paddingTop: 12},

  // Detail modal
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,40,0.5)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  detailHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#DDE1EA', alignSelf: 'center', marginBottom: 18,
  },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16,
  },
  detailHeaderText: {flex: 1},
  detailName: {
    fontSize: 20, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.3,
  },
  detailRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  detailLabel: {
    fontSize: 9, fontWeight: '800', color: '#B0BEC5',
    letterSpacing: 1.2, marginBottom: 5,
  },
  detailValue: {
    fontSize: 14, fontWeight: '600', color: '#1A1A2E',
  },
  detailFooter: {
    flexDirection: 'row', gap: 10, paddingTop: 16,
  },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#3D5AFE', borderRadius: 12, paddingVertical: 13,
    shadowColor: '#3D5AFE', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  detailEditBtnText: {
    color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5,
  },
  detailCloseBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#D0D5DD',
    backgroundColor: '#F9FAFB', alignItems: 'center',
  },
  detailCloseBtnText: {
    fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 0.5,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  navLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  menuBtn: {width: 32, height: 32, justifyContent: 'center'},
  menuLines: {gap: 4},
  menuLine: {width: 22, height: 2.5, backgroundColor: '#1A1A2E', borderRadius: 2},
  navTitle: {fontSize: 17, fontWeight: '800', color: '#1A1A2E', letterSpacing: 0.1},
  navAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#3D5AFE',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  navSubtitle: {
    fontSize: 11, color: '#8A9BB0', paddingHorizontal: 16,
    marginBottom: 20, marginTop: 2, letterSpacing: 0.2,
  },

  // Title row
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 20,
  },
  pageTitle: {fontSize: 28, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.5},
  titleUnderline: {height: 3, width: 48, backgroundColor: '#3D5AFE', borderRadius: 2, marginTop: 4},
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#3D5AFE', paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 12, shadowColor: '#3D5AFE',
    shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  addBtnPlus: {color: '#FFF', fontSize: 18, fontWeight: '700', lineHeight: 20, marginTop: -1},
  addBtnText: {color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.6},

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statBlock: {flex: 1, alignItems: 'center'},
  statLabel: {fontSize: 10, fontWeight: '700', color: '#8A9BB0', letterSpacing: 1, marginBottom: 4},
  statValue: {fontSize: 30, fontWeight: '900', color: '#3D5AFE', letterSpacing: -1},
  statDivider: {width: 1, height: 40, backgroundColor: '#EDEEF5'},

  // Card list
  cardList: {paddingHorizontal: 16, gap: 14},

  // Staff card
  card: {
    backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 14,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderLeftWidth: 0,
  },
  cardHighlighted: {borderLeftWidth: 4, borderLeftColor: '#3D5AFE'},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12},
  cardNameBlock: {flex: 1, gap: 6},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cardName: {fontSize: 16, fontWeight: '700', color: '#1A1A2E', letterSpacing: 0.1},
  newBadge: {backgroundColor: '#FF6B6B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6},
  newBadgeText: {color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.8},
  roleBadge: {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  roleBadgeText: {fontSize: 10, fontWeight: '700', letterSpacing: 0.5},
  cardActions: {flexDirection: 'row', alignItems: 'center', gap: 14},
  actionBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center',
  },
  cardDivider: {height: 1, backgroundColor: '#F0F2F5', marginBottom: 12},
  cardMeta: {flexDirection: 'row', alignItems: 'center'},
  metaItem: {flex: 1, gap: 4},
  metaLabel: {fontSize: 9, fontWeight: '700', color: '#B0BEC5', letterSpacing: 1},
  metaValue: {fontSize: 13, fontWeight: '600', color: '#37474F'},
  metaSeparator: {width: 1, height: 32, backgroundColor: '#EDEEF5', marginHorizontal: 16},

  // ── Add Staff Modal ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,40,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 0,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8A9BB0',
    marginTop: 3,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F5F6FA',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },

  // Form fields
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A9BB0',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#E0E4EB',
    paddingVertical: 8,
    fontSize: 15,
    color: '#1A1A2E',
  },
  fieldInputMultiline: {
    borderWidth: 1.5,
    borderColor: '#E0E4EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    minHeight: 80,
    backgroundColor: '#F8F9FB',
  },

  // Role picker
  rolePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E0E4EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8F9FB',
  },
  rolePickerText: {fontSize: 15, color: '#1A1A2E', fontWeight: '500'},
  rolePickerChevron: {fontSize: 11, color: '#8A9BB0'},
  roleDropdown: {
    borderWidth: 1,
    borderColor: '#E0E4EB',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  roleOption: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  roleOptionActive: {backgroundColor: '#EEF1FF'},
  roleOptionText: {fontSize: 14, color: '#37474F'},
  roleOptionTextActive: {color: '#3D5AFE', fontWeight: '700'},

  // Modal footer buttons
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 0.5,
  },
  saveBtn: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3D5AFE',
    alignItems: 'center',
    shadowColor: '#3D5AFE',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default StaffListScreen;