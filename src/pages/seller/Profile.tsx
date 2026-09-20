import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { jordanPhoneRegex } from '../../utils/validation';

export const SellerProfile: React.FC = () => {
  const { session, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(session?.user.fullName || '');
  const [phone, setPhone] = useState(session?.user.phone || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setPhoneError('Full name must be at least 2 characters.');
      return;
    }

    if (!jordanPhoneRegex.test(phone.trim())) {
      setPhoneError('Phone must be a valid Jordanian mobile (e.g. 0791234567).');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      success('Seller profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(session?.user.fullName || '');
    setPhone(session?.user.phone || '');
    setPhoneError(null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Seller Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store information and primary contact details
          </p>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardHeader
          title="Account Details"
          subtitle="Information associated with your seller credentials"
        />
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name / Store Representative"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Email Address"
                value={session?.user.email || ''}
                disabled
                hint="Email address cannot be changed in prototype mode"
              />

              <Input
                label="Jordanian Mobile Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={phoneError || undefined}
                hint="Format: 07XXXXXXXX (10 digits)"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base">
                  {session?.user.fullName[0] || 'S'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {session?.user.fullName}
                  </h3>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Commercial Seller Account
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {session?.user.email}
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Phone</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {session?.user.phone}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
