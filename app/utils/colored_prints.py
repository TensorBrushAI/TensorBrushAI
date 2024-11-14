import builtins

original_print = builtins.print
def color_text(text, rgb=(51, 255, 153)):
    r, g, b = rgb
    return f"\033[38;2;{r};{g};{b}m{text}\033[0m"
def colored_print(*args, color=(51, 255, 153), **kwargs):
    colored_args = [color_text(str(arg), rgb=color) for arg in args]
    original_print(*colored_args, **kwargs)
builtins.print = colored_print
