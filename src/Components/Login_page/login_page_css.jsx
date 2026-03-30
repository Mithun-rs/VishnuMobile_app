import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e8f0',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#e8e8f0',
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#d8d8e8',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#e8e8f0',
  },

  // Card
  card: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#f5a623',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Title
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginBottom: 28,
  },

  // Labels
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 0,
  },
  inputIcon: {
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.5,
  },

  // Login Button
  loginButton: {
    backgroundColor: '#3949ab',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 18,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Forgot Password
  forgotContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    color: '#888',
    fontSize: 13,
  },

  // Watermark
  watermark: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(57, 73, 171, 0.07)',
    letterSpacing: 4,
  },

  // Footer
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 6,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 10,
    color: '#888',
  },
  footerSeparator: {
    fontSize: 10,
    color: '#aaa',
  },
  icon: {
  marginLeft: 8,
  opacity: 0.6,
}
});

export default styles;