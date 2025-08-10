import numpy as np

def func(patch):  # patch.shape = (3, 3)
    """Rules of a Conway's Game of Life"""
    center = patch[1, 1]
    neighbors = np.sum(patch) - center
    
    # time.sleep(0.001)
    if center == 1:
        if 2 <= neighbors <= 3: return 1
        else: return 0
    else:
        if neighbors == 3: return 1
        else: return 0

def conv2d(matrix, func = np.vectorize(func, signature='(n,n)->()'), padding=1):
    """Slower but sleek, still gives 24fps on my lab PC"""
    padded_matrix = np.pad(matrix, padding, 'constant', constant_values=0)
    arr = np.lib.stride_tricks.sliding_window_view(padded_matrix, (3, 3))
    output = func(arr)
    return output

# def conv2d(matrix, func = func, stride=1, padding=10):
#     """Faster but ugly, gives 30fps on my lab PC"""
#     # Calculate dimensions of output matrix
#     input_height, input_width = matrix.shape
#     kernel_height, kernel_width = 3, 3
#     output_height = (input_height - kernel_height + 2 * padding) // stride + 1
#     output_width = (input_width - kernel_width + 2 * padding) // stride + 1
#     # print(output_height, output_width)

#     # Apply padding to the input matrix
#     padded_matrix = np.pad(matrix, padding, mode='constant')

#     # Initialize the output matrix
#     output = np.zeros((output_height, output_width))
    
#     # Perform convolution
#     for i in range(0, output_height):
#         for j in range(0, output_width):
#             row_start = i * stride
#             row_end   = row_start + kernel_height
#             col_start = j * stride
#             col_end   = col_start + kernel_width
            
#             patch = padded_matrix[row_start:row_end, col_start:col_end]
#             output[i, j] = func(patch)
#     return output
