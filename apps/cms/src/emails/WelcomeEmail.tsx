import * as React from 'react';
import {
  Html as BaseHtml,
  Body as BaseBody,
  Container as BaseContainer,
  Text as BaseText,
  Button as BaseButton,
  Heading as BaseHeading,
  Hr as BaseHr,
  Preview as BasePreview,
} from '@react-email/components';

// تحويلهم لـ any عشان نلغي تعارض الـ React 18/19 Types
const Html = BaseHtml as any;
const Body = BaseBody as any;
const Container = BaseContainer as any;
const Text = BaseText as any;
const Button = BaseButton as any;
const Heading = BaseHeading as any;
const Hr = BaseHr as any;
const Preview = BasePreview as any;

interface WelcomeEmailProps {
  username: string;
}

export const WelcomeEmail = ({ username }: WelcomeEmailProps) => {
  return (
    <Html lang="ar" dir="rtl">
      <Preview>مرحباً بك في مجتمع PlanBlue! 💙</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>أهلاً بك في PlanBlue</Heading>
          <Text style={text}>مرحباً يا **{username}**،</Text>
          <Text style={text}>
            يسعدنا جداً انضمامك إلينا في PlanBlue. تم إنشاء حسابك بنجاح.
          </Text>
          <Button style={btn} href="https://planbluestore.com">
            الانتقال إلى المتجر
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            إذا لم تكن أنت من قام بإنشاء هذا الحساب، يمكنك تجاهل هذا الإيميل.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// ... ستايلاتك تحت زي ما هي
const main = { backgroundColor: '#f6f9fc' };
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
};
const h1 = { color: '#0052cc', fontSize: '24px', textAlign: 'center' as const };
const text = { color: '#333333', textAlign: 'right' as const };
const btn = {
  backgroundColor: '#0052cc',
  color: '#fff',
  display: 'block',
  margin: '30px auto 0',
  padding: '12px 0',
  textAlign: 'center' as const,
};
const hr = { borderColor: '#e6ebf1', margin: '30px 0' };
const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};
