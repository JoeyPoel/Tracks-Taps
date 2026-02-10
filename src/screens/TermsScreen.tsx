import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function TermsScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false} withBottomTabs={true}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader
                showBackButton
                title={t('terms') || 'Terms & Conditions'}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                    <TextComponent variant="h3" style={styles.sectionHeader}>1. Acceptance of the Terms</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        These terms of use are entered into by and between You and Tracks & Taps (&quot;Company&quot;, &quot;we&quot;, or &quot;us&quot;). The following terms and conditions, together with any documents they expressly incorporate by reference (collectively, these &quot;Terms of Use&quot;), govern your access to and use of the Tracks & Taps mobile application, including any content, functionality, and services offered on or through the application (the &quot;App&quot;), whether as a guest or a registered user.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        Please read the Terms of Use carefully before you start to use the App. By using the App, or by clicking to accept or agree to the Terms of Use when this option is made available to you, you accept and agree to be bound and abide by these Terms of Use and our Privacy Policy, found at our website, incorporated herein by reference. If you do not want to agree to these Terms of Use or the Privacy Policy, you must not access or use the App.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>2. Changes to the Terms of Use</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        We may revise and update these Terms of Use from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the App thereafter. However, any changes to the dispute resolution provisions set out in Governing Law and Jurisdiction will not apply to any disputes for which the parties have actual notice on or before the date the change is posted on the App.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        Your continued use of the App following the posting of revised Terms of Use means that you accept and agree to the changes. You are expected to check this page each time you access the App so you are aware of any changes, as they are binding on you.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>3. Accessing the App and Account Security</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        We reserve the right to withdraw or amend existing services or materials we provide on the App in our sole discretion without notice. We will not be liable if for any reason all or any part of the App is unavailable at any time or for any period. From time to time, we may restrict access to some parts of the App, or the entire App, to users, including registered users.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        You are responsible for making all arrangements necessary for you to have access to the App and ensuring that all persons who access the App through your internet connection are aware of these Terms of Use and comply with them.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        To access the App or some of the resources it offers, you may be asked to provide certain registration details or other information. It is a condition of your use of the App that all the information you provide on the App is correct, current, and complete. You agree that all information you provide to register with this App or otherwise, including but not limited to through the use of any interactive features on the App, is governed by our Privacy Policy, and you consent to all actions we take with respect to your information consistent with our Privacy Policy.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>4. Intellectual Property Rights</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        The App and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by the Company, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        These Terms of Use permit you to use the App for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our App, except as follows:
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • Your computer or mobile device may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • You may store files that are automatically cached by your Web browser for display enhancement purposes.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • If we provide social media features with certain content, you may take such actions as are enabled by such features.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>5. Prohibited Uses</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        You may use the App only for lawful purposes and in accordance with these Terms of Use. You agree not to use the App:
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • In any way that violates any applicable federal, state, local, or international law or regulation (including, without limitation, any laws regarding the export of data or software to and from the US or other countries).
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information, or otherwise.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail&quot;, &quot;chain letter&quot;, &quot;spam&quot;, or any other similar solicitation.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity (including, without limitation, by using email addresses or screen names associated with any of the foregoing).
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the App, or which, as determined by us, may harm the Company or users of the App or expose them to liability.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>6. User Contributions</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        The App may contain message boards, chat rooms, personal web pages or profiles, forums, bulletin boards, and other interactive features (collectively, &quot;Interactive Services&quot;) that allow users to post, submit, publish, display, or transmit to other users or other persons (hereinafter, &quot;post&quot;) content or materials (collectively, &quot;User Contributions&quot;) on or through the App.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        All User Contributions must comply with the Content Standards set out in these Terms of Use.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        Any User Contribution you post to the site will be considered non-confidential and non-proprietary. By providing any User Contribution on the App, you grant us and our affiliates and service providers, and each of their and our respective licensees, successors, and assigns the right to use, reproduce, modify, perform, display, distribute, and otherwise disclose to third parties any such material for any purpose.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        You represent and warrant that:
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • You own or control all rights in and to the User Contributions and have the right to grant the license granted above to us and our affiliates and service providers, and each of their and our respective licensees, successors, and assigns.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • All of your User Contributions do and will comply with these Terms of Use.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>7. Monitoring and Enforcement; Termination</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        We have the right to:
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • Remove or refuse to post any User Contributions for any or no reason in our sole discretion.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • Take any action with respect to any User Contribution that we deem necessary or appropriate in our sole discretion, including if we believe that such User Contribution violates the Terms of Use, including the Content Standards, infringes any intellectual property right or other right of any person or entity, threatens the personal safety of users of the App or the public, or could create liability for the Company.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • Disclose your identity or other information about you to any third party who claims that material posted by you violates their rights, including their intellectual property rights or their right to privacy.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        • Terminate or suspend your access to all or part of the App for any or no reason, including without limitation, any violation of these Terms of Use.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>8. Reliance on Information Posted</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        The information presented on or through the App is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to the App, or by anyone who may be informed of any of its contents.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>9. Geographic Restrictions</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        The owner of the App is based in the Netherlands. We provide this App for use only by persons located in countries where the App is available on the Apple App Store and Google Play Store. We make no claims that the App or any of its content is accessible or appropriate outside of these regions. Access to the App may not be legal by certain persons or in certain countries. If you access the App from outside the approved regions, you do so on your own initiative and are responsible for compliance with local laws.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>10. Disclaimer of Warranties</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        You understand that we cannot and do not guarantee or warrant that files available for downloading from the internet or the App will be free of viruses or other destructive code. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for anti-virus protection and accuracy of data input and output, and for maintaining a means external to our site for any reconstruction of any lost data.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        TO THE FULLEST EXTENT PROVIDED BY LAW, WE WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGE CAUSED BY A DISTRIBUTED DENIAL-OF-SERVICE ATTACK, VIRUSES, OR OTHER TECHNOLOGICALLY HARMFUL MATERIAL THAT MAY INFECT YOUR COMPUTER EQUIPMENT, COMPUTER PROGRAMS, DATA, OR OTHER PROPRIETARY MATERIAL DUE TO YOUR USE OF THE APP OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP OR TO YOUR DOWNLOADING OF ANY MATERIAL POSTED ON IT, OR ON ANY WEBSITE LINKED TO IT.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        YOUR USE OF THE APP, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP IS AT YOUR OWN RISK. THE APP, ITS CONTENT, AND ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER THE COMPANY NOR ANY PERSON ASSOCIATED WITH THE COMPANY MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE APP. WITHOUT LIMITING THE FOREGOING, NEITHER THE COMPANY NOR ANYONE ASSOCIATED WITH THE COMPANY REPRESENTS OR WARRANTS THAT THE APP, ITS CONTENT, OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP WILL BE ACCURATE, RELIABLE, ERROR-FREE, OR UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, THAT OUR SITE OR THE SERVER THAT MAKES IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT THE APP OR ANY SERVICES OR ITEMS OBTAINED THROUGH THE APP WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        TO THE FULLEST EXTENT PROVIDED BY LAW, THE COMPANY HEREBY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, AND FITNESS FOR PARTICULAR PURPOSE.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>11. Limitation on Liability</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL THE COMPANY, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE APP, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE APP OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>12. Indemnification</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        You agree to defend, indemnify, and hold harmless the Company, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to your violation of these Terms of Use or your use of the App, including, but not limited to, your User Contributions, any use of the App&apos;s content, services, and products other than as expressly authorized in these Terms of Use, or your use of any information obtained from the App.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>13. Governing Law and Jurisdiction</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        All matters relating to the App and these Terms of Use, and any dispute or claim arising therefrom or related thereto (in each case, including non-contractual disputes or claims), shall be governed by and construed in accordance with the internal laws of the Netherlands without giving effect to any choice or conflict of law provision or rule.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        Any legal suit, action, or proceeding arising out of, or related to, these Terms of Use or the App shall be instituted exclusively in the federal courts of the Netherlands. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>14. Waiver and Severability</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        No waiver by the Company of any term or condition set out in these Terms of Use shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of the Company to assert a right or provision under these Terms of Use shall not constitute a waiver of such right or provision.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        If any provision of these Terms of Use is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms of Use will continue in full force and effect.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>15. Entire Agreement</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        The Terms of Use and our Privacy Policy constitute the sole and entire agreement between you and Tracks & Taps regarding the App and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the App.
                    </TextComponent>

                    <TextComponent variant="h3" style={styles.sectionHeader}>16. Your Comments and Concerns</TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        This website is operated by Tracks & Taps. All notices of copyright infringement claims should be sent to the copyright agent designated in our Copyright Policy in the manner and by the means set out therein.
                    </TextComponent>
                    <TextComponent color={theme.textSecondary} style={styles.paragraph}>
                        All other feedback, comments, requests for technical support, and other communications relating to the App should be directed to: Tracks.taps@gmail.com.
                    </TextComponent>

                    <View style={styles.spacer} />
                </View>

                <View style={styles.footer}>
                    <TextComponent color={theme.textSecondary} variant="caption" style={{ textAlign: 'center' }}>
                        Last Updated: January 2026
                    </TextComponent>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginTop: 10,
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 24,
    },
    paragraph: {
        lineHeight: 24,
        marginBottom: 16,
    },
    spacer: {
        height: 20,
    },
    footer: {
        marginTop: 24,
        marginBottom: 20,
    }
});
