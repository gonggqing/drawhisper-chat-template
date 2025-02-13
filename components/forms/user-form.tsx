import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useUserStore from "@/lib/store/user-store";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChangeEvent, useState, useEffect } from "react";
import { UserCircleGear } from "@phosphor-icons/react";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const userFormSchema = z.object({
    username: z.string().min(1, {
        message: "Username is required",
    }),
    avatar: z.string().optional(),
    info: z.string().optional(),
});

function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export const UserForm = () => {
    const user = useUserStore((state) => state.getUser());
    const setUser = useUserStore((state) => state.setUser);
    const setAvatar = useUserStore((state) => state.setAvatar);
    const setInfo = useUserStore((state) => state.setInfo);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof userFormSchema>>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            username: '',
            avatar: '',
            info: '',
        }
    });

    // Initialize form with user data when available
    useEffect(() => {
        if (user) {
            form.reset({
                username: user.username || '',
                avatar: user.avatar || '',
                info: user.info || '',
            });
            if (user.avatar) {
                setImagePreview(user.avatar);
            }
        }
    }, [user, form]);

    async function onSubmit(values: z.infer<typeof userFormSchema>) {
        setLoading(true);

        if (!values.username) {
            toast.error("Username is required");
            setLoading(false);
            return;
        }

        try {
            setUser(values.username);
            
            if (values.avatar) {
                setAvatar(values.avatar);
            }

            if (values.info) {
                setInfo(values.info);
            }
            
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Only .jpg, .jpeg, .png and .webp formats are supported");
            return;
        }

        try {
            const base64 = await convertToBase64(file);
            setImagePreview(base64);
            form.setValue('avatar', base64);
        } catch (error) {
            toast.error("Failed to load image");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="light_blue" size="icon" className="h-9 w-9 bg-[color:#edf2fb] hover:bg-[color:#d7e3fc] transition-all duration-300 rounded-full">
                    <UserCircleGear size={24} weight="fill" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Avatar</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[color:#edf2fb] file:text-[color:#2b2d42] hover:file:bg-[color:#d7e3fc]"
                                            />
                                        </div>
                                    </FormControl>
                                    {imagePreview && (
                                        <div className="mt-4 flex justify-center">
                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Avatar preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="info"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Info</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="your info" {...field} rows={3} className="resize-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}