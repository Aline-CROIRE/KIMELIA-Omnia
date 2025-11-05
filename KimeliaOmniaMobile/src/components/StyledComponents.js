import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, GRADIENTS } from '../constants';

// General Container for screens
export const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.softCream};
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

// Gradient background for screens
export const GradientBackground = styled(LinearGradient).attrs({
  colors: GRADIENTS.background,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
`;

// Scrollable container
export const ScrollContainer = styled.ScrollView`
  flex: 1;
  background-color: transparent; /* Make it transparent to show GradientBackground */
  padding: 20px;
`;

// Content container for layout
export const ContentContainer = styled.View`
  flex: 1;
  padding: 20px;
  width: 100%;
  align-items: center;
`;

// Title styling
export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${COLORS.deepCoffee};
  margin-bottom: 30px;
  font-family: ${FONTS.primary};
  text-align: center;
`;

// Subtitle styling
export const SubTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${COLORS.chocolateBrown};
  margin-bottom: 15px;
  font-family: ${FONTS.secondary};
  text-align: center;
`;

// Input field styling
export const Input = styled.TextInput.attrs({
  placeholderTextColor: COLORS.tan,
})`
  width: 100%;
  height: 50px;
  background-color: ${COLORS.white};
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  font-size: 16px;
  color: ${COLORS.deepCoffee};
  border: 1px solid ${COLORS.lightCocoa};
  font-family: ${FONTS.secondary};
`;

// TextArea styling
export const TextArea = styled.TextInput.attrs({
  placeholderTextColor: COLORS.tan,
  multiline: true,
  textAlignVertical: 'top',
})`
  width: 100%;
  min-height: 100px;
  background-color: ${COLORS.white};
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
  font-size: 16px;
  color: ${COLORS.deepCoffee};
  border: 1px solid ${COLORS.lightCocoa};
  font-family: ${FONTS.secondary};
`;

// Button styling
export const Button = styled.TouchableOpacity`
  width: 100%;
  background-color: ${props => props.primary ? COLORS.chocolateBrown : COLORS.copper};
  padding: 15px;
  border-radius: 8px;
  align-items: center;
  margin-bottom: 10px;
  elevation: 3; /* Add elevation for better visibility */
`;

// Gradient button styling
export const GradientButton = styled.TouchableOpacity`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  ${props => props.disabled && `opacity: 0.6;`}
`;

// Gradient background for buttons
export const GradientButtonBackground = styled(LinearGradient).attrs(props => ({
  colors: props.colors || GRADIENTS.primaryButton,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  padding: 15px;
  align-items: center;
  justify-content: center;
`;

// Button text styling
export const ButtonText = styled.Text`
  color: ${COLORS.white};
  font-size: 18px;
  font-weight: bold;
  font-family: ${FONTS.primary};
`;

// Link text styling
export const LinkText = styled.Text`
  color: ${COLORS.chocolateBrown};
  font-size: 16px;
  font-family: ${FONTS.secondary};
  margin-top: 10px;
  text-decoration-line: underline;
  text-align: center; /* Centered for better UX */
`;

// Error text styling
export const ErrorText = styled.Text`
  color: ${COLORS.errorRed};
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;

// Success text styling
export const SuccessText = styled.Text`
  color: ${COLORS.successGreen};
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;

// Loading indicator styling
export const LoadingIndicator = styled.ActivityIndicator.attrs({
  color: COLORS.chocolateBrown,
  size: 'large',
})`
  margin-top: 20px;
`;

// Card styling
export const Card = styled.TouchableOpacity`
  background-color: ${COLORS.white};
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  elevation: 5;
  border: 1px solid ${COLORS.lightCocoa};
`;

// Card title styling
export const CardTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${COLORS.deepCoffee};
  margin-bottom: 5px;
  font-family: ${FONTS.primary};
`;

// Card description styling
export const CardDescription = styled.Text`
  font-size: 14px;
  color: ${COLORS.deepCoffee};
  margin-bottom: 10px;
  font-family: ${FONTS.secondary};
`;

// Detail text styling
export const DetailText = styled.Text`
  font-size: 15px;
  color: ${COLORS.deepCoffee};
  margin-bottom: 5px;
  font-family: ${FONTS.secondary};
`;

// Label styling
export const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${COLORS.chocolateBrown};
  margin-top: 10px;
  margin-bottom: 5px;
  align-self: flex-start;
`;

// Badge styling
export const Badge = styled.View`
  background-color: ${props => {
    switch (props.type) {
      case 'high':
      case 'urgent':
        return COLORS.errorRed;
      case 'medium':
      case 'in-progress':
        return COLORS.copper;
      case 'low':
      case 'pending':
        return COLORS.tan;
      case 'completed':
        return COLORS.successGreen;
      case 'info':
      case 'default':
        return COLORS.chocolateBrown;
      default:
        return COLORS.lightCocoa;
    }
  }};
  border-radius: 15px;
  padding: 5px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
`;

// Badge text styling
export const BadgeText = styled.Text`
  color: ${COLORS.white};
  font-size: 12px;
  font-weight: bold;
`;

// Row styling
export const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
`;

// Section styling
export const Section = styled.View`
  width: 100%;
  margin-bottom: 20px;
  align-items: flex-start; /* Default for sections */
`;

// Floating action button styling
export const FloatingActionButton = styled.TouchableOpacity`
  position: absolute;
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  right: 30px;
  bottom: 30px;
  background-color: ${COLORS.gold};
  border-radius: 30px;
  elevation: 8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

// FAB text styling
export const FabText = styled.Text`
  font-size: 30px;
  color: ${COLORS.white};
  line-height: 32px;
`;

// Modal background styling
export const ModalBackground = styled.Pressable`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

// Modal content styling
export const ModalContent = styled.View`
  background-color: ${COLORS.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
  width: 100%;
  align-items: center;
`;

// Modal button row styling
export const ModalButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  margin-top: 15px;
`;

// Date display button styling
export const DateDisplayButton = styled(GradientButton).attrs({
  colors: GRADIENTS.secondaryButton,
})`
  width: 100%;
  padding: 0;
`;

// Date display button text styling
export const DateDisplayButtonText = styled.Text`
  color: ${COLORS.deepCoffee};
  font-size: 16px;
  font-family: ${FONTS.secondary};
`;

// New components for module dashboards

export const ModuleCard = styled.TouchableOpacity`
  width: 100%;
  border-radius: 15px;
  overflow: hidden; /* To make sure the gradient respects the border radius */
  margin-bottom: 20px;
  elevation: 8;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
`;

export const ModuleCardBackground = styled(LinearGradient)`
  padding: 25px;
  flex-direction: row;
  align-items: center;
`;

export const ModuleCardContent = styled.View`
  flex: 1;
  margin-left: 20px;
`;

export const ModuleCardTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${COLORS.white};
  font-family: ${FONTS.primary};
`;

export const ModuleCardDescription = styled.Text`
  font-size: 14px;
  color: ${COLORS.softCream};
  font-family: ${FONTS.secondary};
  margin-top: 5px;
`;
