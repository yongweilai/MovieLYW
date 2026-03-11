import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Option = {
  label: string;
  value: string;
};

type CategoryDropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
}) => {
  const [expanded, setExpanded] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find(item => item.value === value);
  }, [options, value]);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  const handleSelect = (nextValue: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange(nextValue);
    setExpanded(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.header, expanded && styles.headerExpanded]}
        onPress={handleToggle}
      >
        <Text style={styles.headerText}>
          {selectedOption?.label || placeholder}
        </Text>

        <Text style={styles.arrow}>{expanded ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.menu}>
          {options.map(item => {
            const isSelected = item.value === value;

            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.8}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(item.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default CategoryDropdown;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 4,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },

  headerExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },

  arrow: {
    fontSize: 20,
    color: '#111111',
    marginLeft: 12,
  },

  menu: {
    padding: 12,
    backgroundColor: '#ffffff',
  },

  option: {
    minHeight: 40,
    borderRadius: 2,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#f7f7f7',
    marginBottom: 8,
  },

  optionSelected: {
    backgroundColor: '#15a9d6',
  },

  optionText: {
    fontSize: 14,
    color: '#222222',
  },

  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
});