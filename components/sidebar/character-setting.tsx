"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import useCharacter from "@/lib/store/character-store";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const characterSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    avatar: z.string().min(1, { message: "Avatar is required" }),
    personality: z.string().min(1, { message: "Personality is required" }),
    initial_message: z.string().min(1, { message: "Initial message is required" }),
    memory: z.string().optional(),
});

function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export const CharacterSetting = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const character = useCharacter((state) => state);

    const form = useForm<z.infer<typeof characterSchema>>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            name: '',
            avatar: '',
            description: '',
            personality: '',
            initial_message: '',
            memory: '',
        }
    });

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

    const handleSubmit = async (data: z.infer<typeof characterSchema>) => {
        setLoading(true);
        try {
            const characterId = character.createCharacter(
                data.name,
                data.avatar,
                data.description,
                data.memory || null,
                data.personality,
                data.initial_message
            );

            const newCharacter = character.getCharacterById(characterId);
            if (newCharacter) {
                character.setCurrentCharacter(newCharacter);
            }

            toast.success("Character created successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to create character");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full h-12 font-bold justify-start">
                   <p>New Character </p> <Plus size={24} weight="bold" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Character Settings</DialogTitle>
                    <DialogDescription>
                        Manage your character settings here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Character name" {...field} />
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
                                        {(imagePreview || value) && (
                                            <div className="mt-4 flex justify-center">
                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                                    <img 
                                                        src={imagePreview || value || "/image/radien.jpg"} 
                                                        alt="Character avatar" 
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
                                name="initial_message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Message</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter character initial message" {...field} rows={2} className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter character description" {...field} rows={5} className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Personality</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter character personality" {...field} rows={2} className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Character"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}