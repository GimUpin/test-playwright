const TestHelpers = require('../../src/utils/helpers');

class UserDataFixtures {
  // Valid user data for successful registration
  static getValidUserData() {
    const userData = TestHelpers.generateRegistrationData();
    userData.confirmPassword = userData.password;
    
    return {
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: TestHelpers.formatDateForInput(userData.dateOfBirth),
      address: userData.address,
      city: userData.city,
      postalCode: userData.postalCode
    };
  }

  // Invalid email test cases
  static getInvalidEmailData() {
    return [
      {
        description: 'missing @ symbol',
        email: 'testexample.com',
        expectedError: 'Email không hợp lệ'
      },
      {
        description: 'missing domain',
        email: 'test@',
        expectedError: 'Email không hợp lệ'
      },
      {
        description: 'missing local part',
        email: '@example.com',
        expectedError: 'Email không hợp lệ'
      },
      {
        description: 'empty email',
        email: '',
        expectedError: 'Email là bắt buộc'
      },
      {
        description: 'email with spaces',
        email: 'test @example.com',
        expectedError: 'Email không hợp lệ'
      },
      {
        description: 'email too long',
        email: 'a'.repeat(250) + '@example.com',
        expectedError: 'Email quá dài'
      }
    ];
  }

  // Invalid password test cases
  static getInvalidPasswordData() {
    return [
      {
        description: 'too short (less than 8 characters)',
        password: '1234567',
        expectedError: 'Mật khẩu phải có ít nhất 8 ký tự'
      },
      {
        description: 'missing uppercase letter',
        password: 'password123!',
        expectedError: 'Mật khẩu phải chứa ít nhất 1 chữ hoa'
      },
      {
        description: 'missing lowercase letter',
        password: 'PASSWORD123!',
        expectedError: 'Mật khẩu phải chứa ít nhất 1 chữ thường'
      },
      {
        description: 'missing number',
        password: 'Password!',
        expectedError: 'Mật khẩu phải chứa ít nhất 1 số'
      },
      {
        description: 'missing special character',
        password: 'Password123',
        expectedError: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'
      },
      {
        description: 'empty password',
        password: '',
        expectedError: 'Mật khẩu là bắt buộc'
      }
    ];
  }

  // Invalid phone number test cases
  static getInvalidPhoneData() {
    return [
      {
        description: 'too short',
        phone: '012345678',
        expectedError: 'Số điện thoại không hợp lệ'
      },
      {
        description: 'too long',
        phone: '01234567890',
        expectedError: 'Số điện thoại không hợp lệ'
      },
      {
        description: 'invalid prefix',
        phone: '0123456789',
        expectedError: 'Số điện thoại không hợp lệ'
      },
      {
        description: 'contains letters',
        phone: '098abc1234',
        expectedError: 'Số điện thoại không hợp lệ'
      },
      {
        description: 'empty phone',
        phone: '',
        expectedError: 'Số điện thoại là bắt buộc'
      },
      {
        description: 'contains special characters',
        phone: '098-123-456',
        expectedError: 'Số điện thoại không hợp lệ'
      }
    ];
  }

  // Password confirmation mismatch test cases
  static getPasswordMismatchData() {
    return [
      {
        description: 'passwords do not match',
        password: 'Password123!',
        confirmPassword: 'Password456!',
        expectedError: 'Mật khẩu xác nhận không khớp'
      },
      {
        description: 'confirm password empty',
        password: 'Password123!',
        confirmPassword: '',
        expectedError: 'Xác nhận mật khẩu là bắt buộc'
      }
    ];
  }

  // Required field test cases
  static getRequiredFieldData() {
    const baseData = this.getValidUserData();
    
    return [
      {
        description: 'missing first name',
        data: { ...baseData, firstName: '' },
        expectedError: 'Họ là bắt buộc'
      },
      {
        description: 'missing last name',
        data: { ...baseData, lastName: '' },
        expectedError: 'Tên là bắt buộc'
      },
      {
        description: 'missing email',
        data: { ...baseData, email: '' },
        expectedError: 'Email là bắt buộc'
      },
      {
        description: 'missing password',
        data: { ...baseData, password: '' },
        expectedError: 'Mật khẩu là bắt buộc'
      },
      {
        description: 'missing phone',
        data: { ...baseData, phone: '' },
        expectedError: 'Số điện thoại là bắt buộc'
      }
    ];
  }

  // Edge case test data
  static getEdgeCaseData() {
    return [
      {
        description: 'minimum valid age (18 years old)',
        dateOfBirth: TestHelpers.formatDateForInput(
          new Date(new Date().setFullYear(new Date().getFullYear() - 18))
        )
      },
      {
        description: 'very long name',
        firstName: 'A'.repeat(50),
        lastName: 'B'.repeat(50)
      },
      {
        description: 'special characters in name',
        firstName: 'Nguyễn Văn',
        lastName: 'Hà Nội'
      },
      {
        description: 'international email domain',
        email: `test_${TestHelpers.generateRandomString(8)}@international-domain.co.uk`
      }
    ];
  }

  // Existing user test data
  static getExistingUserData() {
    return {
      email: 'existing.user@test.com',
      password: 'ExistingUser123!',
      confirmPassword: 'ExistingUser123!',
      firstName: 'Existing',
      lastName: 'User',
      phone: '0987654321',
      dateOfBirth: '01/01/1995',
      address: '123 Test Street',
      city: 'Test City',
      postalCode: '12345'
    };
  }

  // Bulk test users for performance testing
  static generateBulkUsers(count = 10) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(this.getValidUserData());
    }
    return users;
  }

  // Test user with minimal required fields only
  static getMinimalValidUserData() {
    const userData = TestHelpers.generateRegistrationData();
    
    return {
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    };
  }

  // Test user with all optional fields filled
  static getCompleteUserData() {
    const userData = this.getValidUserData();
    
    return {
      ...userData,
      middleName: 'Middle',
      nickname: 'TestNick',
      gender: 'other',
      company: 'Test Company',
      jobTitle: 'Test Engineer',
      website: 'https://test.example.com',
      bio: 'This is a test user bio for automation testing purposes.',
      interests: ['technology', 'testing', 'automation']
    };
  }
}

module.exports = UserDataFixtures;
